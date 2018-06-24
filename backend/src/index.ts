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

const sql = new sequelize('rtlist', 'root', 'rootpassword', {
  host: '127.0.0.1',
  dialect: 'mysql',
  operatorsAliases: false
});

sql.authenticate().then(() => {
  console.log('database succesfully authenticated');
}).catch(err => {
  console.log('db error :(');
});

const Item = sql.define('item', {
  id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: sequelize.DATE, allowNull: true },
  uuid: { type: sequelize.STRING, unique: true },
  text: { type: sequelize.STRING },
  added_by: { type: sequelize.INTEGER, allowNull: false },
  checked: { type: sequelize.BOOLEAN },
  checked_by: { type: sequelize.INTEGER, allowNull: true }
});

const User = sql.define('user', {
  id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: sequelize.STRING, unique: true },
  email: { type: sequelize.STRING, unique: true },
  password: { type: sequelize.STRING }
});

User.sync();
Item.sync();

User.hasMany(Item, { foreignKey: 'added_by' });
User.hasMany(Item, { foreignKey: 'checked_by' });

User.sync();
Item.sync();

// Add some defaults to the db if they aren't there already
User.upsert({ username: 'admin', email: 'admin@localhost.com', password: 'admin' });
User.upsert({ username: 'test1', email: 'test@localhost.com', password: 'test1' });
Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a20', text: 'Sample item', added_by: 1, checked: false, checked_by: null });
Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a31', text: 'Sample item', added_by: 2, checked: true, checked_by: 1 });

const jwtSecret = 'secret!'; // This should go into a conf file later on
const jwtExpiresIn = '20m';

let app = express();
let serv = http.createServer(app);
let io = socketio(serv);
io.use(jwtAuth.authenticate({ secret: jwtSecret }, (payload, done) => {
  return done(null, payload.username, 'passing token back');
}));
io.use((socket, next) => {
  // Add a timeout to every connection to force a disconnect on token expiry
  let token = socket.request._query.auth_token;
  if (token) {
    registerSocketExpiry(socket, token);
    next();
  } else {
    console.error('Cannot find token in connection query');
    next(new Error('Authentication error'));
  }
})

app.use(bodyparser.json()); // support json encoded bodies
app.use(bodyparser.urlencoded({ extended: true })); // support encoded bodies
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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

  let user = await User.find({ where: { username }, raw: true }) as UserInstance;
  if (!user) {
    res.send(JSON.stringify({ error: 'Cannot find user', token: null }));
    return;
  }
  if (user.password !== password) {
    res.send(JSON.stringify({ error: 'password does not match', token: null }));
    return;
  }
  const token = jwt.sign({ username }, jwtSecret, { expiresIn: jwtExpiresIn });
  console.log(token);
  console.log(jwt.verify(token, jwtSecret));

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
    user = await User.create({ username, email, password }) as UserInstance;
  } catch (e) {
    const error: string = e.errors[0].message;
    console.error('Error registering new user: ', error);
    if (error.includes('username')) {
      return res.send(JSON.stringify({ error: 'This user already exists, please choose a unique username' }));
    } else if (error.includes('email')) {
      return res.send(JSON.stringify({ error: 'This email address has already been used, please choose a unique email address' }));
    }
  }
  const token = jwt.sign({ username }, jwtSecret, { expiresIn: jwtExpiresIn });
  console.log(token);
  console.log(jwt.verify(token, jwtSecret));

  res.send(JSON.stringify({ 'token': token }));
});

async function sendCurrentDb(socket: SocketIO.Socket, broadcast?: boolean) {
  // try catch goes here
  // Do a raw query here because sequelize joins are a pain
  let results = await sql.query('select items.*, a.username as addedBy, c.username as checkedBy from items left join users a on items.added_by = a.id left join users c on items.checked_by = c.id', { type: sequelize.QueryTypes.SELECT });
  if (!broadcast) {
    socket.emit('receivedInitialState', results);
  } else {
    io.emit('receivedInitialState', results);
  }
}

function registerSocketExpiry(socket: SocketIO.Socket, token: string) {
  let timeout;
  let decodedToken = jwt.verify(token, jwtSecret) as { username: string; exp: number; token: string }; // cast this bitch
  if (decodedToken) {
    timeout = setTimeout(() => {
      console.log('disconnecting the socket');
      socket.emit('disconnectClient', 'token expired');
      socket.disconnect();
    }, decodedToken.exp * 1000 - Date.now());
  }
}

io.on('connection', (socket) => {
  // When a user connects, send the current state of the list to them
  // sendCurrentDb(socket);

  // Now register the socket listeners for the various events
  socket.on('getAll', () => {
    sendCurrentDb(socket);
  });

  socket.on('checkedItem', (uuid: string, text: string, checked: boolean, checked_by: string) => {
    console.log(uuid, { text, checked, checked_by }, 'was clicked');
    Item.update({ text, checked, checked_by }, { where: { uuid } }).catch((err) => {
      console.log(err);
    });
    socket.broadcast.emit('checkedItem', uuid, text, checked, checked_by);
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
    sendCurrentDb(socket, true);
  });

  socket.on('showLogs', async () => {
    let items = await Item.findAll({ raw: true });
    console.log(items);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  })
})

serv.listen(3001, '0.0.0.0', () => {
  console.log('Listening');
});
