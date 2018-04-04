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

Item.find({ raw: true }).then(item => {
  console.log(item); 
});

let app = express();
let serv = http.createServer(app);
let io = socketio(serv);

function createArrayFromMap(arr: IterableIterator<[string, IListItem]>) {
  let itemsArr = [];
  for (let i of arr) {
    itemsArr.push({ id: i[0], text: i[1].text, checked: i[1].checked });
  }
  return itemsArr;
}

// let items: { [id: string]: IItems } = { };
let items: Map<string, IListItem> = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log('sending response to client');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  // When a user connects, send the current state of the list to them
  // But first convert the map to array for the react components
  socket.emit('receivedInitialState', createArrayFromMap(items.entries()));

  // Now register the socket listeners for the various events
  socket.on('click', (id: string, text: string, checked: boolean) => {
    console.log(id, { text, checked }, 'was clicked');
    items.set(id, { text, checked });
    console.log(items);
    socket.broadcast.emit('click', id, text, checked);
  });

  socket.on('addItem', (id: string, text: string) => {
    console.log(id, text, 'was added');
    items.set(id, { text, checked: false });
    Item.create({ uuid: id, text, checked: false });
    socket.broadcast.emit('addRemoteItem', id, text);
  });

  socket.on('deleteItem', (id: string) => {
    items.delete(id);
    console.log(id, 'was removed');
    socket.broadcast.emit('deleteRemoteItem', id);
  });

  socket.on('resetList', () => {
    console.log('resetting list');
    items.clear();
    io.emit('receivedInitialState', createArrayFromMap(items.entries()));
  });

  socket.on('showLogs', () => {
    Item.findAll({ raw: true }).then(items => {
      console.log(items);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    console.log(items);
    // items.clear();
  })
})

serv.listen(3001, '0.0.0.0', () => {
  console.log('Listening');
});