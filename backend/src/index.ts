import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as sequelize from 'sequelize';
import * as jwt from 'jsonwebtoken';
import * as bodyparser from 'body-parser';
import * as jwtAuth from 'socketio-jwt-auth';

interface IListItem {
  text: string;
  checked: boolean;
}

interface UserAttributes {
  id?: string;
  username: string;
  password: string;
}

type UserInstance = sequelize.Instance<UserAttributes> & UserAttributes;

class Server {
  private readonly sql: sequelize.Sequelize;
  private Item: sequelize.Model<any, any>; // Hax, but it works
  private User: sequelize.Model<any, any>;
  private jwtSecret = 'secret!'; // This should go into a conf file later on
  private jwtExpiresIn = '60m';

  private HTTPServer: http.Server;
  private WebServer: WebServer;
  private WebsocketsServer: SocketIO.Server;

  public constructor() {
    this.sql = new sequelize('rtlist', 'root', 'rootpassword', {
      host: '127.0.0.1',
      dialect: 'mysql',
      operatorsAliases: false
    });
  }

  public async run() {
    await this.initializeDB();
    await this.initializeHTTPServer();
    this.initializeWebsockets();

    this.WebServer.listen();
  }

  private async initializeDB() {
    try {
      await this.sql.authenticate()
      console.log('database succesfully authenticated');
    } catch (e) {
      console.log('db error :(');
    }
    this.Item = this.sql.define('item', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      date: { type: sequelize.DATE, allowNull: true },
      uuid: { type: sequelize.STRING, unique: true },
      text: { type: sequelize.STRING },
      added_by: { type: sequelize.INTEGER, allowNull: false },
      checked: { type: sequelize.BOOLEAN },
      checked_by: { type: sequelize.INTEGER, allowNull: true }
    });

    this.User = this.sql.define('user', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: sequelize.STRING, unique: true },
      email: { type: sequelize.STRING, unique: true },
      password: { type: sequelize.STRING }
    });

    this.User.sync();
    this.Item.sync();

    this.User.hasMany(this.Item, { foreignKey: 'added_by' });
    this.User.hasMany(this.Item, { foreignKey: 'checked_by' });

    this.User.sync();
    this.Item.sync();

    // Add some defaults to the db if they aren't there already
    this.User.upsert({ username: 'admin', email: 'admin@localhost.com', password: 'admin' });
    this.User.upsert({ username: 'test1', email: 'test@localhost.com', password: 'test1' });
    this.Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a20', text: 'Sample item', added_by: 1, checked: false, checked_by: null });
    this.Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a31', text: 'Sample item', added_by: 2, checked: true, checked_by: 1 });
  }

  private async initializeHTTPServer() {
    this.WebServer = new WebServer(this.User, this.Item, this.jwtSecret, this.jwtExpiresIn);
    this.HTTPServer = await this.WebServer.run();
  }

  private initializeWebsockets() {
    this.WebsocketsServer = new WebsocketsServer(this.HTTPServer, this.jwtSecret, this.jwtExpiresIn, this.sql, this.User, this.Item).run();
  }
}

class WebServer {
  private readonly app: express.Express;
  private readonly server: http.Server;
  private readonly User: sequelize.Model<any, any>;
  private readonly Item: sequelize.Model<any, any>;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  public constructor(User: sequelize.Model<any, any>, Item: sequelize.Model<any, any>, jwtSecret: string, jwtExpiresIn: string) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.User = User;
    this.Item = Item;
    this.jwtSecret = jwtSecret; // This should possibly be static on the main class :thinking:
    this.jwtExpiresIn = jwtExpiresIn;
  }

  public async run() {
    this.configureMiddleware(this.app);
    this.configureRoutes(this.app);

    return this.getServer();
  }

  public listen() {
    this.server.listen(3001, '0.0.0.0', ()=>{
      console.log('listening from the callback');
    });
    console.log('Listening on port 3001');
  }

  private configureMiddleware(app: express.Express) {
    app.use(bodyparser.json()); // support json encoded bodies
    app.use(bodyparser.urlencoded({ extended: true })); // support encoded bodies
    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
  }

  private configureRoutes(app: express.Express) {
    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html');
      console.log('sending response to client');
    });

    app.post('/login', async (req, res) => {
      console.log(req.body.username, req.body.password);
      let username: string = req.body.username;
      let password: string = req.body.password;
      if (!username) {
        res.send(JSON.stringify({ error: 'No username', token: null }));
        return;
      }

      let user = await this.User.find({ where: { username }, raw: true }) as UserInstance;
      if (!user) {
        res.send(JSON.stringify({ error: 'Cannot find user', token: null }));
        return;
      }
      if (user.password !== password) {
        res.send(JSON.stringify({ error: 'password does not match', token: null }));
        return;
      }
      const token = jwt.sign({ username, id: user.id }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
      console.log(token);
      console.log(jwt.verify(token, this.jwtSecret));

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ 'token': token }));
    });

    app.post('/register', async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      console.log('User is registering', username, email, password);
      if (!username) {
        return res.send(JSON.stringify({ error: 'No username sent' }));
      }
      if (!email) {
        return res.send(JSON.stringify({ error: 'No email sent' }));
      }
      if (!password) {
        return res.send(JSON.stringify({ error: 'No password sent' }));
      }
      let user;
      try {
        user = await this.User.create({ username, email, password }) as UserInstance;
      } catch (e) {
        const error: string = e.errors[0].message;
        console.error('Error registering new user: ', error);
        if (error.includes('username')) {
          return res.send(JSON.stringify({ error: 'This user already exists, please choose a unique username' }));
        } else if (error.includes('email')) {
          return res.send(JSON.stringify({ error: 'This email address has already been used, please choose a unique email address' }));
        }
      }
      const token = jwt.sign({ username }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
      console.log(token);
      console.log(jwt.verify(token, this.jwtSecret));

      res.send(JSON.stringify({ 'token': token }));
    });
  }

  private getServer() {
    return this.server;
  }
}

class WebsocketsServer {
  private readonly httpServer: http.Server;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly sql: sequelize.Sequelize;
  private readonly User: sequelize.Model<any, any>;
  private readonly Item: sequelize.Model<any, any>;
  private io: SocketIO.Server;

  public constructor(httpServer: http.Server, jwtSecret: string, jwtExpiresIn: string, sql: sequelize.Sequelize, User: sequelize.Model<any, any>, Item: sequelize.Model<any, any>) {
    this.httpServer = httpServer;
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.sql = sql;
    this.User = User;
    this.Item = Item;
  }

  public run() {
    this.io = socketio(this.httpServer);
    this.configureMiddleware(this.io);
    this.registerSocketRoutes(this.io, this.sql, this.User, this.Item);

    return this.io;
  }

  private configureMiddleware(io: SocketIO.Server) {
    io.use(jwtAuth.authenticate({ secret: this.jwtSecret }, (payload, done) => {
      return done(null, payload.username, 'passing token back');
    }));
    io.use((socket, next) => {
      // Add a timeout to every connection to force a disconnect on token expiry
      let token = socket.request._query.auth_token;
      if (token) {
        this.registerSocketExpiry(socket, token);
        next();
      } else {
        console.error('Cannot find token in connection query');
        next(new Error('Authentication error'));
      }
    })
  }

  private registerSocketExpiry(socket: SocketIO.Socket, token: string) {
    let timeout;
    let decodedToken = jwt.verify(token, this.jwtSecret) as { username: string; exp: number; token: string }; // cast this bitch
    if (decodedToken) {
      timeout = setTimeout(() => {
        console.log('disconnecting the socket');
        socket.emit('disconnectClient', 'token expired');
        socket.disconnect();
      }, decodedToken.exp * 1000 - Date.now());
    }
  }

  private async sendCurrentDb(socket: SocketIO.Socket, io: SocketIO.Server, sql: sequelize.Sequelize, broadcast?: boolean) {
    // Do a raw query here because sequelize joins are a pain
    let results = await sql.query('select items.*, a.username as addedBy, c.username as checkedBy from items left join users a on items.added_by = a.id left join users c on items.checked_by = c.id', { type: sequelize.QueryTypes.SELECT });
    if (!broadcast) {
      socket.emit('receivedInitialState', results);
    } else {
      io.emit('receivedInitialState', results);
    }
  }

  private registerSocketRoutes(io: SocketIO.Server, sql: sequelize.Sequelize, User: sequelize.Model<any, any>, Item: sequelize.Model<any, any>) {
    io.on('connection', (socket) => {
      // When a user connects, send the current state of the list to them
      // sendCurrentDb(socket);

      // Now register the socket listeners for the various events
      socket.on('getAll', () => {
        this.sendCurrentDb(socket, io, sql);
      });

      socket.on('checkedItem', async (uuid: string, text: string, checked: boolean, checkedBy: string, checkedById: number) => {
        console.log(uuid, { text, checked, checkedBy }, 'was clicked');
        // get the id of the user that checked the item
        Item.update({ text, checked, checked_by: checkedById }, { where: { uuid } }).catch((err) => {
          console.log(err);
        });
        socket.broadcast.emit('checkedItem', uuid, text, checked, checkedBy);
      });

      socket.on('addItem', async (username: string, uuid: string, text: string) => {
        console.log(uuid, text, 'was added by', username);
        // Not great to do a lookup for every insert.
        let user_id = await User.findOne({ where: { username } }) as UserInstance;
        Item.create({ added_by: user_id.id, uuid, text, checked: false });
        socket.broadcast.emit('addRemoteItem', username, uuid, text);
      });

      socket.on('deleteItem', (id: string) => {
        Item.destroy({ where: { uuid: id } });
        console.log(id, 'was removed');
        socket.broadcast.emit('deleteRemoteItem', id);
      });

      socket.on('resetList', async () => {
        console.log('resetting list');
        await Item.truncate();
        this.sendCurrentDb(socket, io, sql, true);
      });

      socket.on('showLogs', async () => {
        let items = await Item.findAll({ raw: true });
        console.log(items);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      })
    })
  }
}

let server = new Server();
server.run();




