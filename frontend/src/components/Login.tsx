import * as React from 'react';
import Button from 'material-ui/Button/Button';
import { Redirect } from 'react-router';

interface LoginProps {
  redirectToOnSuccess: string;
  callback: (username: string, token: string) => void;
}

interface LoginState {
  username: string;
  password: string;
  isAuth: boolean;
}

export class Login extends React.Component<LoginProps, LoginState> {
  public constructor(props: LoginProps) {
    super(props);
    this.state = { username: '', password: '', isAuth: false };

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
    try {
      let token = await this.login(this.state.username, this.state.password);
      this.props.callback(this.state.username, token);
      this.setState({ isAuth: true });
    } catch (e) {
      console.error('Error loggin in: ', e);
      this.setState({ isAuth: false });
    }
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
        console.log(token.token);
        res(token.token);
      } else {
        rej(token.error);
      }
    });
  }

  public render() {
    return (
      !this.state.isAuth ? (
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
          <div>
            <Redirect to={this.props.redirectToOnSuccess} />
          </div>
        )
    );
  }
}