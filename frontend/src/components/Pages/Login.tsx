import * as React from 'react';
import Button from 'material-ui/Button/Button';
import { Redirect } from 'react-router';
import { SnackbarError } from '../SnackbarError';
import { postData } from '../../lib/fetch';

interface LoginProps {
  redirectToOnSuccess: string;
  callback: (username: string, token: string) => void;
}

interface LoginState {
  username: string;
  password: string;
  isAuth: boolean;
  loginFailure: boolean;
  loginFailureReason: string;
}

export class Login extends React.Component<LoginProps, LoginState> {
  public constructor(props: LoginProps) {
    super(props);
    this.state = { username: '', password: '', isAuth: false, loginFailure: false, loginFailureReason: '' };

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
      console.error('Error logging in: ', e);
      this.setState({ isAuth: false, loginFailure: true, loginFailureReason: e });
    }
  }

  private async login(username: string, password: string) {
    return new Promise<string>(async (res, rej) => {
      const responseToken = await postData('http://localhost:3001/login', { username, password });
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
    if (!this.state.isAuth) {
      return (
        <div>
          You are not authenticated. Please login to see this page
            <form onSubmit={this.handleInputSubmit}>
            <input name="username" onChange={this.handleUsernameChange} placeholder="Username" />
            <input name="password" onChange={this.handlePasswordChange} placeholder="Password" />
            <Button type="submit" variant="raised">
              Submit
            </Button>
          </form>
          <SnackbarError show={this.state.loginFailure} message={'Failed to login: ' + this.state.loginFailureReason} onClose={(event, reason) => { this.setState({ loginFailure: false }); }} />
        </div>
      );
    } else {
      return (
        <div>
          <Redirect to={this.props.redirectToOnSuccess} />
        </div>
      );
    }
  }
}
