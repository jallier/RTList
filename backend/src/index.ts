import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

interface IListItem {
  text: string;
  checked: boolean;
}

let app = express();
let serv = http.createServer(app);
let io = socketio(serv);

// let items: { [id: string]: IItems } = { };
let items: Map<string, IListItem> = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log('sending response to client');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('click', (id: string, text: string, checked: boolean) => {
    console.log(id, { text, checked });
    items.set(id, { text, checked });
    console.log(items);
    socket.broadcast.emit('click', id, text, checked); 
  });
  socket.on('addItem', (id: string, text: string) => {
    console.log(id, text);
    items.set(id, { text, checked: false })
    socket.broadcast.emit('addRemoteItem', id, text);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
    console.log(items);
    items.clear();
  })
})

serv.listen(3001, '0.0.0.0', () => {
  console.log('Listening');
});