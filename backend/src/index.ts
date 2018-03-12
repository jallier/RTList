import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

let app = express();
let serv = http.createServer(app);
let io = socketio(serv);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log('sending response to client');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  io.emit('msg', 'testing');
  socket.on('cmsg', (msg)=>{
    console.log(msg);
  })
  socket.on('disconnect', ()=>{
    console.log('User disconnected');
  })
})

serv.listen(3000, () => {
  console.log('Listening');
});