import * as React from 'react';
import './App.css';
import { ListBox } from './listbox';
import * as socket from 'socket.io-client';
import * as styled from './styled-components';
import { Component } from 'react';
import { Redirect } from 'react-router';
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

export class App extends React.Component {
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

export class Test extends React.Component {
  render() {
    return (
      <div className="test">
        <header>This is a test page</header>
        <Body>
          This is the second page that should dynamically replace the first page. Fingers crossed.
        </Body>
      </div>
    );
  }
}

export class Protected extends React.Component {
  public async postData(url: string, data: any) {
    return fetch(url, {
      body: JSON.stringify(data), // must match 'Content-Type' header
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, same-origin, *omit
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // *client, no-referrer
    });
  }

  public async login() {
    const token = await this.postData('http://localhost:3001/login', { username: 'admin', password: 'admin' });
    return token;
  }

  public async componentDidMount() {
    const token = await this.login();
    console.log(await token.json());
  }

  public render() {
    return (
      <div className="protected">
        <header>This is a protected route</header>
        <Body>
          This page is protected. It should only be able to be accessed when logged in
        </Body>
      </div>
    );
  }
}

export default App;
