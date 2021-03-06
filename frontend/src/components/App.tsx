import * as React from "react";
import "../css/App.css";
import { Home } from "./Pages/Home";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { ProtectedRoute, ProtectedRouteProps } from "./PrivateRoute";
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import * as jwt from "jsonwebtoken";
import * as socket from "socket.io-client";
import { Header } from "./Header";
import { Error404 } from "./Pages/404";
import { Profile } from "./Pages/Profile";
import { PaddedBody } from "./PaddedBody";
import styled from "react-emotion";
import JssProvider from "react-jss/lib/JssProvider";
import { create } from "jss";
import { createGenerateClassName, jssPreset } from "@material-ui/core/styles";
import EventListener from "./EventListener";
// import { List } from "./List";

const generateClassName = createGenerateClassName();
const jss = create({
  ...jssPreset(),
  // We define a custom insertion point that JSS will look for injecting the styles in the DOM.
  insertionPoint: document.getElementById("jss-insertion-point") || undefined
});
interface AppState {
  auth?: {
    username: string;
    userId: number;
    token: string;
    expiresAt: string;
  };
}

const hostGiven = !!process.env.REACT_APP_SERVER_HOST;
const host = process.env.REACT_APP_SERVER_HOST || "localhost";
const port = "3001";
export const server = {
  baseUrl: `${hostGiven ? "https" : "http"}://${host}${
    !hostGiven ? `:${port}` : ""
  }`
};

export class App extends React.Component<any, AppState> {
  private io: SocketIOClient.Socket;
  constructor(props: any) {
    super(props);
    this.state = {};
    const token = sessionStorage.getItem("token");
    if (token) {
      const decodedToken = jwt.decode(token);
      if (decodedToken && Math.floor(Date.now() / 1000) < decodedToken["exp"]) {
        this.handleConnectToSocket(token);
        this.state = {
          auth: {
            token,
            username: decodedToken["username"],
            userId: decodedToken["id"],
            expiresAt: decodedToken["exp"]
          }
        };
      }
    }

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  private handleConnectToSocket(token: string) {
    this.io = socket.connect(`${server.baseUrl}`, {
      secure: true,
      query: `auth_token=${token}`
    });
    this.io.on("disconnectClient", () => {
      this.setState({ auth: undefined });
    });
  }

  public handleLogin(username: string, token: string) {
    sessionStorage.setItem("token", token);
    this.handleConnectToSocket(token);
    const decodedToken = jwt.decode(token);
    this.setState({
      auth: {
        token,
        username: decodedToken ? decodedToken["username"] : undefined,
        userId: decodedToken ? decodedToken["id"] : undefined,
        expiresAt: decodedToken ? decodedToken["exp"] : undefined
      }
    });
  }

  public handleLogout() {
    sessionStorage.removeItem("token");
    this.setState({ auth: undefined });
  }

  public render(): JSX.Element {
    const links = [{ to: "/", text: "Home" }];
    if (!this.state.auth) {
      links.push(
        { to: "/login", text: "Login" },
        { to: "/register", text: "Register" }
      );
    } else {
      links.push({ to: "/list", text: "List Page" });
    }
    return (
      <JssProvider jss={jss} generateClassName={generateClassName}>
        <div
          className="body"
          style={{ display: "flex", flexFlow: "column", height: "100vh" }}
        >
          <Header
            links={links}
            username={this.state.auth ? this.state.auth.username : undefined}
          />

          <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route
              path="/login"
              render={props => (
                <Login
                  {...props}
                  redirectToOnSuccess={"/list"}
                  callback={this.handleLogin}
                />
              )}
            />
            <Route
              path="/register"
              render={props => (
                <Register
                  {...props}
                  redirectOnSuccess={"/list"}
                  callback={this.handleLogin}
                />
              )}
            />
            <ProtectedRoute
              isAuthenticated={this.state.auth ? true : false}
              redirectToPath={"/login"}
              exact={true}
              path="/list"
              render={props => (
                <EventListener
                  io={this.io}
                  username={this.state.auth ? this.state.auth.username : ""}
                  userId={this.state.auth ? this.state.auth.userId : 0}
                />
              )}
            />
            <ProtectedRoute
              isAuthenticated={this.state.auth ? true : false}
              redirectToPath={"/login"}
              path="/profile"
              render={props => <Profile handleLogout={this.handleLogout} />}
            />
            <Route component={Error404} />
          </Switch>
        </div>
      </JssProvider>
    );
  }
}

export default App;
