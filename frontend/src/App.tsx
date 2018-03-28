import * as React from 'react';
import './App.css';
import { ListBox } from './listbox';
import * as socket from 'socket.io-client';
import * as styled from './styled-components';
// const logo = require('./logo.svg');

// tslint:disable-next-line:max-line-length
// This is the ip that the clients connect to. Make it a public one if you want to connect to something outside of this pc
export const io = socket.connect('http://localhost:3001');
export function handleSocket() {
  // tslint:disable-next-line:no-any
  io.on('msg', (msg: any) => {
    // tslint:disable-next-line:no-console
    console.log(msg);
  });
}
const Body = styled.default.div`
  background-color: #EEEEEE
`;

class App extends React.Component {
  render() {
    return (
      <div className="body">
        <header>
          <h1>List</h1>
        </header>
        <Body>
          <ListBox text="ayy lmao" />
        </Body>
      </div>
    );
  }
}

export default App;
