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

let app = express();
let serv = http.createServer(app);
let io = socketio(serv);

// TODO: 
// Convert to proper class
// Add proper async handling for db calls

async function sendCurrentDb(socket: SocketIO.Socket, broadcast?: boolean) {
  // try catch goes here
  let results = await Item.findAll({ raw: true });
  console.log('Current items', results);
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

  socket.on('resetList', () => {
    console.log('resetting list');
    Item.truncate();
    sendCurrentDb(socket, true);
  });

  socket.on('showLogs', () => {
    Item.findAll({ raw: true }).then(items => {
      console.log(items);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    console.log(items);
  })
})

serv.listen(3001, '0.0.0.0', () => {
  console.log('Listening');
});