import * as socket from 'socket.io-client';

const io = socket.connect('http://localhost:3000');
export function handleSocket() {
  // tslint:disable-next-line:no-any
  io.on('msg', (msg: any) => {
    // tslint:disable-next-line:no-console
    console.log(msg);
    io.emit('cmsg', 'ayyyy lmao');
  });
}
