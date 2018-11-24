import * as React from 'react';
import Button from '@material-ui/core/Button';
import { postData } from '../../lib/fetch';
import { Redirect } from 'react-router';
import { CenteredLayout } from '../CenteredLayout';
import { Input, StyledPaper, Form, StyledTextField } from '../styles';
import { Typography } from '@material-ui/core';
import { server } from '../App';

interface RegisterProps {
  redirectOnSuccess: string;
  callback: (username: string, token: string) => void;
}

interface RegisterState {
  username: string;
  email: string;
  password: string;
  registerFailure: boolean;
  registerFailureReason: string;
  isRegistered: boolean;
}

export class Register extends React.Component<RegisterProps, RegisterState> {
  constructor(props: RegisterProps) {
    super(props);
    this.state = { username: '', email: '', password: '', registerFailure: false, registerFailureReason: '', isRegistered: false };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
  }

  private handleUsernameChange(e: React.SyntheticEvent<any>) {
    this.setState({ username: e.currentTarget.value });
  }

  private handleEmailChange(e: React.SyntheticEvent<any>) {
    this.setState({ email: e.currentTarget.value });
  }

  private handlePasswordChange(e: React.SyntheticEvent<any>) {
    this.setState({ password: e.currentTarget.value });
  }

  private async handleInputSubmit(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    // e.currentTarget.reset();
    try {
      let token = await this.register(this.state.username, this.state.email, this.state.password);
      this.props.callback(this.state.username, token);
      this.setState({ isRegistered: true });
    } catch (e) {
      console.error('Error registering: ', e);
      this.setState({ registerFailure: true, registerFailureReason: e });
    }
  }

  private async register(username: string, email: string, password: string) {
    return new Promise<string>(async (res, rej) => {
      const responseToken = await postData(`${server.baseUrl}/register`, { username, email, password });
      let token = await responseToken.json();
      if (token.token) {
        console.log(token.token);
        res(token.token);
      } else {
        rej(token.error);
      }
    });
  }

  public render() {
    if (this.state.isRegistered) {
      return (<Redirect to={this.props.redirectOnSuccess} />);
    } else {
      return (
        <CenteredLayout toppadding={'25px'}>
          <StyledPaper elevation={4}>
            <Typography variant="h4">Sign up for an account</Typography>
            <br />
            <Form onSubmit={this.handleInputSubmit}>
              <StyledTextField
                name="username"
                label="Username"
                variant="outlined"
                onChange={this.handleUsernameChange}
              />
              <StyledTextField
                name="email"
                label="Email address"
                variant="outlined"
                onChange={this.handleEmailChange}
              />
              <StyledTextField
                name="password"
                label="Password"
                variant="outlined"
                type="password"
                onChange={this.handlePasswordChange}
              />
              <Button type="submit" variant="contained" color="primary">
                Register
              </Button>
            </Form>
          </StyledPaper>
        </CenteredLayout>
      );
    }
  }
}
