import * as React from 'react';
import '../css/App.css';
import { ListBox } from './listbox';
import * as socket from 'socket.io-client';
import * as styled from './styled-components';
import { Component } from 'react';
import { Redirect } from 'react-router';
import { InputForm } from './InputForm';
import Button from 'material-ui/Button/Button';
import { Home } from './Pages/Home';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { ProtectedRoute, ProtectedRouteProps } from './PrivateRoute';
import { Test } from './Test';
import { Login } from './Login';
import * as jwt from 'jsonwebtoken';
// const logo = require('./logo.svg');

// This is the ip that the clients connect to. Make it a public one if you want to connect to something outside of this pc
export const io = socket.connect('http://localhost:3001');

const Body = styled.default.div`
  background-color: #EEEEEE
`;

interface AppState {
  auth?: {
    username: string;
    token: string;
    expiresAt: string;
  };
}

export class List extends React.Component {
  public render() {
    return (
      <div>
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

export class TestPrivate extends React.Component {
  render() {
    return (
      <div>
        This is a private page
      </div>
    );
  }
}

export class App extends React.Component<any, AppState> {
  constructor(props: any) {
    super(props);
    this.state = {};
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = jwt.decode(token);
      if (decodedToken && Math.floor(Date.now() / 1000) < decodedToken['exp']) {
        this.state = { auth: { username: decodedToken['username'], expiresAt: decodedToken['exp'], token } };
        console.log('Time: ', Math.floor(Date.now() / 1000), 'Token exp: ', decodedToken['exp'], 'Current time less than saved', Math.floor(Date.now() / 1000) < decodedToken['exp']);
      }
    }

    this.handleLogin = this.handleLogin.bind(this);
  }

  public handleLogin(username: string, token: string) {
    sessionStorage.setItem('token', token);
    let decodedToken = jwt.decode(token);
    this.setState({ auth: { username, token, expiresAt: decodedToken ? decodedToken['exp'] : undefined } });
  }

  public render(): JSX.Element {
    return (
      <div className="body">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/list">List Page</Link></li>

        <Route exact={true} path="/" component={Home} />
        <Route path="/login" render={(props) => <Login {...props} redirectToOnSuccess={'/list'} callback={this.handleLogin} />} />
        <ProtectedRoute isAuthenticated={this.state.auth ? true : false} redirectToPath={'/login'} exact={true} path="/list" component={List} />
      </div>
    );
  }
}

export default App;
