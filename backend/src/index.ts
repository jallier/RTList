import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

interface IItems {
  id: string;
  value: string;
}

let app = express();
let serv = http.createServer(app);
let io = socketio(serv);

let items: IItems[] = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log('sending response to client');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('click', (msg: string) => {
    console.log(msg);
    socket.emit('click', 'Button was clicked, and processed by the server');
  });
  socket.on('addItem', (id: string, value: string) => {
    console.log(id, value);
    items.push({id, value});
    socket.broadcast.emit('addRemoteItem', id, value);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
    console.log(items);
    items = [];
  })
})

serv.listen(3001, '0.0.0.0', () => {
  console.log('Listening');
});