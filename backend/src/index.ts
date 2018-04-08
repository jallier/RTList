import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as sequelize from 'sequelize';

interface IListItem {
  text: string;
  checked: boolean;
}

const sql = new sequelize('rtlist', 'root', 'password'{
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
  id: { type: sequelize.INTEGER, primaryKey: true },
  date: { type: sequelize.DATE, allowNull: true },
  uuid: { type: sequelize.STRING },
  text: { type: sequelize.STRING },
  checked: { type: sequelize.BOOLEAN }
}, { timestamps: false });

const User = sql.define('user', {
  id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: sequelize.STRING },
  password: { type: sequelize.STRING }
});

Item.sync();
User.sync();

// Add some defaults to the db if they aren't there already
Item.upsert({id: 1, uuid:'1def48f0-3adb-11e8-b13e-35e3613a0a20', text:'Sample item', checked:false});
User.upsert({id: 1, username: 'admin', password:'admin'});

let app = express();
let serv = http.createServer(app);
let io = socketio(serv);

async function sendCurrentDb(socket: SocketIO.Socket, broadcast?: boolean) {
  // try catch goes here
  let results = await Item.findAll({ raw: true });
  // console.log('Current items', results);
  if (!broadcast) {
    socket.emit('receivedInitialState', results);
  } else {
    io.emit('receivedInitialState', results);
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log('sending response to client');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  // When a user connects, send the current state of the list to them
  sendCurrentDb(socket);

  // Now register the socket listeners for the various events
  socket.on('checkedItem', (uuid: string, text: string, checked: boolean) => {
    console.log(uuid, { text, checked }, 'was clicked');
    Item.update({ text, checked }, { where: { uuid } }).catch((err) => {
      console.log(err);
    });
    socket.broadcast.emit('checkedItem', uuid, text, checked);
  });

  socket.on('addItem', (uuid: string, text: string) => {
    console.log(uuid, text, 'was added');
    Item.create({ uuid, text, checked: false });
    socket.broadcast.emit('addRemoteItem', uuid, text);
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