import * as React from "react";
import styled from "react-emotion";
import { Link, NavLink } from "react-router-dom";
import { PaddedBody } from "./PaddedBody";
import { AppBar, Toolbar } from "@material-ui/core";

type Children = JSX.Element[]; // | JSX.Element | string;

interface HeaderProps {
  children?: Children;
  username?: string;
  links?: { to: string; text: string }[];
}

const Li = styled("div")`
  padding-right: 5px;
`;

const Nav = styled("nav")`
  width: 100%;
  height: 50px;
  background-color: red;
  display: flex;
  align-items: center;
`;

const LinkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  padding: "5px"
};

const ActiveLinkStyle: React.CSSProperties = { fontWeight: "bold" };

export class Header extends React.Component<HeaderProps> {
  public render() {
    // Render the links properly
    const output = [];
    if (this.props.links) {
      const len = this.props.links.length;
      let i = 0;
      for (i = 0; i < len; i++) {
        if (i < len - 1) {
          output.push(
            <Li key={i}>
              <NavLink
                to={this.props.links[i].to}
                style={LinkStyle}
                activeStyle={ActiveLinkStyle}
                exact={true}
              >
                {this.props.links[i].text}
              </NavLink>
            </Li>
          );
        } else {
          output.push(
            <Li key={i}>
              <NavLink
                to={this.props.links[i].to}
                style={LinkStyle}
                activeStyle={ActiveLinkStyle}
                exact={true}
              >
                {this.props.links[i].text}
              </NavLink>
            </Li>
          );
        }
      }
      if (this.props.username) {
        output.push(
          <Li key={i++} style={{ marginLeft: "auto" }}>
            <NavLink
              to={"/profile"}
              style={LinkStyle}
              activeStyle={ActiveLinkStyle}
              exact={true}
            >
              {this.props.username}
            </NavLink>
          </Li>
        );
      }
    }
    return (
      <AppBar position={"relative"}>
        <Toolbar>{output}</Toolbar>
      </AppBar>
    );
  }
}
