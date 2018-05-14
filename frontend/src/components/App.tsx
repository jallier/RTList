import * as React from 'react';
import '../css/App.css';
import { ListBox } from './listbox';
import * as styled from './styled-components';
import { Redirect } from 'react-router';
import { InputForm } from './InputForm';
import Button from 'material-ui/Button/Button';
import { Home } from './Pages/Home';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { ProtectedRoute, ProtectedRouteProps } from './PrivateRoute';
import { Test } from './Test';
import { Login } from './Pages/Login';
import { Register } from './Pages/Register';
import * as jwt from 'jsonwebtoken';
import * as socket from 'socket.io-client';
import { Header } from './Header';
// const logo = require('./logo.svg');

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

export class List extends React.Component<{ io: SocketIOClient.Socket }, any> {
  public render() {
    return (
      <div>
        <header>
          <h1>List</h1>
        </header>
        <Body>
          <ListBox text="ayy lmao" io={this.props.io} />
        </Body>
      </div>
    );
  }
}

export class App extends React.Component<any, AppState> {
  private io: SocketIOClient.Socket;
  constructor(props: any) {
    super(props);
    this.state = {};
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = jwt.decode(token);
      if (decodedToken && Math.floor(Date.now() / 1000) < decodedToken['exp']) {
        this.handleConnectToSocket(token);
        this.state = { auth: { username: decodedToken['username'], expiresAt: decodedToken['exp'], token } };
      }
    }

    this.handleLogin = this.handleLogin.bind(this);
  }

  private handleConnectToSocket(token: string) {
    this.io = socket.connect('http://localhost:3001', { secure: true, query: 'auth_token=' + token });
    this.io.on('disconnectClient', () => { this.setState({ auth: undefined }); });
  }

  public handleLogin(username: string, token: string) {
    sessionStorage.setItem('token', token);
    this.handleConnectToSocket(token);
    let decodedToken = jwt.decode(token);
    this.setState({
      auth: {
        token,
        username: decodedToken ? decodedToken['username'] : undefined,
        expiresAt: decodedToken ? decodedToken['exp'] : undefined
      }
    });

  }

  public render(): JSX.Element {
    return (
      <div className="body">
        <Header links={[{ to: '/', text: 'Home' }, { to: '/list', text: 'List Page' }, { to: '/register', text: 'Register' }]} />

        <Route exact={true} path="/" component={Home} />
        <Route path="/login" render={(props) => <Login {...props} redirectToOnSuccess={'/list'} callback={this.handleLogin} />} />
        <Route path="/register" render={(props) => <Register {...props} redirectOnSuccess={'/list'} callback={this.handleLogin} />} />
        <ProtectedRoute
          isAuthenticated={this.state.auth ? true : false}
          redirectToPath={'/login'}
          exact={true}
          path="/list"
          render={(props) => <List io={this.io} />}
        />
      </div>
    );
  }
}

export default App;