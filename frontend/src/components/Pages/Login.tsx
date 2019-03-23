import * as React from "react";
import Button from "@material-ui/core/Button";
import { Redirect } from "react-router";
import { SnackbarError } from "../SnackbarError";
import { postData } from "../../lib/fetch";
import { CenteredLayout } from "../CenteredLayout";
import Typography from "@material-ui/core/Typography";
import { StyledPaper, Form, StyledTextField, BGDiv } from "../styles";
import { server } from "../App";

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
    this.state = {
      username: "",
      password: "",
      isAuth: false,
      loginFailure: false,
      loginFailureReason: ""
    };

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
      console.error("Error logging in: ", e);
      this.setState({
        isAuth: false,
        loginFailure: true,
        loginFailureReason: e
      });
    }
  }

  private async login(username: string, password: string) {
    return new Promise<string>(async (res, rej) => {
      const responseToken = await postData(`${server.baseUrl}/login`, {
        username,
        password
      });
      let token: {
        token: string | undefined;
        error?: string | undefined;
      } = await responseToken.json();
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
        <BGDiv>
          <CenteredLayout toppadding={"25px"}>
            <StyledPaper elevation={4}>
              <Typography variant="h4">Log In</Typography>
              <br />
              <Form onSubmit={this.handleInputSubmit}>
                <StyledTextField
                  name="username"
                  variant="outlined"
                  label="Username"
                  onChange={this.handleUsernameChange}
                />
                <StyledTextField
                  name="password"
                  label="Password"
                  variant="outlined"
                  type="password"
                  onChange={this.handlePasswordChange}
                />
                <Button type="submit" variant="contained" color="primary">
                  Login
                </Button>
              </Form>
              <SnackbarError
                show={this.state.loginFailure}
                message={"Failed to login: " + this.state.loginFailureReason}
                onClose={(event, reason) => {
                  this.setState({ loginFailure: false });
                }}
              />
            </StyledPaper>
          </CenteredLayout>
        </BGDiv>
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
