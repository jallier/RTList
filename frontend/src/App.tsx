import * as React from 'react';
import './App.css';
import { ListBox } from './listbox';
import * as socket from 'socket.io-client';
import * as styled from './styled-components';
import { Component } from 'react';
import { Redirect } from 'react-router';
import { InputForm } from './InputForm';
import Button from 'material-ui/Button/Button';
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

export class Protected extends React.Component<{}, { username: string, password: string }> {
  private isLoggedIn: boolean;

  public constructor(props: {}) {
    super({});
    this.isLoggedIn = false;
    this.state = { username: '', password: '' };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
  }

  public handleUsernameChange(e: React.SyntheticEvent<any>) {
    this.setState({ username: e.currentTarget.value });
  }
  public handlePasswordChange(e: React.SyntheticEvent<any>) {
    this.setState({ password: e.currentTarget.value });
  }

  public async handleInputSubmit(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    e.currentTarget.reset();
    await this.login(this.state.username, this.state.password);
    this.forceUpdate();
  }
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

  public async login(username: string, password: string) {
    return new Promise<string>(async (res, rej) => {
      const responseToken = await this.postData('http://localhost:3001/login', { username, password });
      let token: { token: string | undefined, error?: string | undefined } = await responseToken.json();
      if (token.token) {
        sessionStorage.setItem('token', token.token);
        this.isLoggedIn = true;
        console.log(token.token);
      } else {
        console.log('error logging in');
        rej(token.error);
      }
      res(token.token);
    });
  }

  public render() {
    console.log(this.isLoggedIn);
    return (
      !this.isLoggedIn ?
        (
          <div>
            You are not authenticated. Please login to see this page
            <form onSubmit={this.handleInputSubmit}>
              <input name="username" onChange={this.handleUsernameChange} placeholder="Username" />
              <input name="password" onChange={this.handlePasswordChange} placeholder="Password" />
              <Button type="submit" variant="raised">
                Submit
            </Button>
            </form>
          </div>
        ) : (
          <Redirect to={{ pathname: '/' }} />
        )
    );
  }
}

export default App;
