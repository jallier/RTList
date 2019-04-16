import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as sequelize from 'sequelize';
import * as jwt from 'jsonwebtoken';
import * as bodyparser from 'body-parser';
import * as jwtAuth from 'socketio-jwt-auth';
import { logger } from './logger';
import { Database, DBModel, UserInstance, ItemInstance } from './database';
import { getNewMaxPosition, normalizeItemPositions } from './lib/database-functions';
import * as bcrypt from 'bcryptjs';

interface IListItem {
  text: string;
  checked: boolean;
}

class Server {
  private db: Database;
  private Item: DBModel // Hax, but it works
  private User: DBModel;
  private jwtSecret = 'secret!'; // This should go into a conf file later on
  private jwtExpiresIn = '60m';

  private HTTPServer: http.Server;
  private WebServer: WebServer;
  private WebsocketsServer: SocketIO.Server;

  public constructor() {
    this.db = new Database();
  }

  public async run() {
    await this.db.run();
    this.User = this.db.getUserModel();
    this.Item = this.db.getItemModel();
    await this.initializeHTTPServer(this.User, this.Item);
    this.initializeWebsockets();

    this.WebServer.listen();
  }

  private async initializeHTTPServer(User: DBModel, Item: DBModel) {
    this.WebServer = new WebServer(User, Item, this.jwtSecret, this.jwtExpiresIn);
    this.HTTPServer = await this.WebServer.run();
  }

  private initializeWebsockets() {
    this.WebsocketsServer = new WebsocketsServer(this.HTTPServer, this.jwtSecret, this.jwtExpiresIn, this.db.getSequelizeObject(), this.User, this.Item).run();
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
    this.server.listen(3001, '0.0.0.0', () => {
      logger.info('listening from the callback');
    });
    logger.info('Listening on port 3001')
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
      // res.sendFile(__dirname + '/index.html');
      res.send('Successful request!');
      logger.debug('sending response to client');
    });

    app.post('/login', async (req, res) => {
      logger.debug(req.body.username, req.body.password);
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
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        res.send(JSON.stringify({ error: 'password does not match', token: null }));
        return;
      }
      const token = jwt.sign({ username, id: user.id }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
      logger.debug(token);
      logger.debug('JWT: ', jwt.verify(token, this.jwtSecret));

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ 'token': token }));
    });

    app.post('/register', async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      logger.info('User is registering', username, email, password);
      if (!username) {
        return res.send(JSON.stringify({ error: 'No username sent' }));
      }
      if (!email) {
        return res.send(JSON.stringify({ error: 'No email sent' }));
      }
      if (!password) {
        return res.send(JSON.stringify({ error: 'No password sent' }));
      }
      let user: UserInstance;
      let passwordHash = await this.getPasswordHash(password);
      try {
        user = await this.User.create({ username, email, password: passwordHash });
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
      logger.debug(token);
      logger.debug('JWT', jwt.verify(token, this.jwtSecret));

      res.send(JSON.stringify({ 'token': token }));
    });
  }

  private async getPasswordHash(password: string) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
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
        logger.info('disconnecting the socket');
        socket.emit('disconnectClient', 'token expired');
        socket.disconnect();
      }, decodedToken.exp * 1000 - Date.now());
    }
  }

  private async sendCurrentDb(socket: SocketIO.Socket, io: SocketIO.Server, sql: sequelize.Sequelize, broadcast?: boolean) {
    // Do a raw query here because sequelize joins are a pain
    let results;
    try {
      results = await sql.query('select items.*, a.username as addedBy, c.username as checkedBy from items left join users a on items.added_by = a.id left join users c on items.checked_by = c.id', { type: sequelize.QueryTypes.SELECT });
    } catch (e) {
      logger.error(e);
    }
    if (!broadcast) {
      socket.emit('receivedInitialState', results);
    } else {
      io.emit('receivedInitialState', results);
    }
    logger.info('Sent all items to ' + (!broadcast ? 'single client' : 'all clients'));
  }

  /**
   * Find an item by its uuid
   * @param uuid The uuid of the item to find
   */
  private async findItem(uuid: string): Promise<any>{ // Fix the typing for this at some point
    return await this.Item.findOne({
          where: { uuid },
          include: [
            { model: this.User, as: "addedBy" },
            { model: this.User, as: "checkedBy" }
          ]
        });
  }

  private registerSocketRoutes(io: SocketIO.Server, sql: sequelize.Sequelize, User: sequelize.Model<any, any>, Item: sequelize.Model<any, any>) {
    io.on('connection', (socket) => {
      // When a user connects, send the current state of the list to them
      // sendCurrentDb(socket);
      logger.debug(`${socket.id} User connected`)

      // Now register the socket listeners for the various events
      socket.on('getAll', () => {
        this.sendCurrentDb(socket, io, sql);
      });

      /**
       * Handle when an item is checked
       */
      socket.on('checkedItem', async (uuid: string, text: string, checked: boolean, checkedBy: string, checkedById: number) => {
        logger.debug(uuid, { text, checked, checkedBy }, 'was clicked');
        // get the id of the user that checked the item
        let newPosition = 0;
        let item = await this.findItem(uuid);
        if(!item){
          return;
        }
        try {
          if (checked) {
            newPosition = await getNewMaxPosition(Item);
            await item.update({
              text,
              checked,
              checked_by: checkedById,
              archived: false,
              position: newPosition
            });
          } else {
            // This may cause issues later where there is already a 0th item.
            await item.update({
              text,
              checked,
              checked_by: checkedById,
              archived: false,
              position: newPosition
            });
            normalizeItemPositions(Item);
          }
        } catch (e) {
          logger.error(e);
        }
        // Extract the fields for the UI. This should be a function lol
        item = item.get({plain: true});
        item.addedBy = item.addedBy && item.addedBy.username;
        item.checkedBy = item.checkedBy && item.checkedBy.username;

        logger.debug('the item that was updated is: ', item);
        socket.broadcast.emit('checkedItem', item);
      });

      socket.on('addItem', async (username: string, uuid: string, text: string) => {
        logger.debug(uuid, text, 'was added by', username);
        // Not great to do a lookup for every insert.
        let user = await User.findOne({ where: { username } }) as UserInstance;
        let position = 0;
        Item.create({ added_by: user.id, uuid, text, checked: false, position });
        normalizeItemPositions(Item); // This is gonna be a source of inefficiencies - there should be a better way to do this
        socket.broadcast.emit('addRemoteItem', username, uuid, text, position);
      });

      /**
       * Handle when an item's text is updated
       */
      socket.on("updateItem", async (uuid: string, text: string) => {

        let item = await this.findItem(uuid);
        if (!item) {
          return;
        }

        // Update and save it
        item.text = text;
        await item.save();
        item = item.get({ plain: true });

        logger.debug(uuid, "was updated to", text);

        // Extract the fields for the UI
        item.addedBy = item.addedBy && item.addedBy.username;
        item.checkedBy = item.checkedBy && item.checkedBy.username;

        // Broadcast the change to the other clients
        socket.broadcast.emit("updateItem", item);
      });

      /**
       * Handle deleting an item
       */
      socket.on("deleteItem", (uuid: string) => {
        Item.destroy({ where: { uuid: uuid } });
        logger.debug(uuid, "was removed");
        socket.broadcast.emit("deleteRemoteItem", uuid);
      });

      socket.on('resetList', async () => {
        logger.debug('resetting list');
        await Item.truncate();
        this.sendCurrentDb(socket, io, sql, true);
      });

      socket.on('showLogs', async () => {
        let items = await Item.findAll({ raw: true });
        logger.debug('Items: ', items);
      });

      socket.on('completedList', async (userId: string) => {
        let completedItems = await Item.update({ archived: true, checked: true, checked_by: userId }, { where: { archived: false, checked: true } });
        this.sendCurrentDb(socket, io, sql, true);
        logger.debug('Completed ' + completedItems[0] + ' items: ');
        let user = await User.findOne({ where: { id: userId } });
        socket.broadcast.emit('notification', `List completed by ${user.username}`)
      });

      socket.on('disconnect', () => {
        logger.debug(`${socket.id} User disconnected`)
      })
    })
  }
}

let server = new Server();
server.run();




