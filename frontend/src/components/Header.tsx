import * as React from "react";
import styled from "react-emotion";
import { Link } from "react-router-dom";
import { PaddedBody } from "./PaddedBody";

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
              <Link to={this.props.links[i].to}>
                {this.props.links[i].text}
              </Link>
              {"\u00A0"}|
            </Li>
          );
        } else {
          output.push(
            <Li key={i}>
              <Link to={this.props.links[i].to}>
                {this.props.links[i].text}
              </Link>
            </Li>
          );
        }
      }
      if (this.props.username) {
        output.push(
          <Li key={i++} style={{ marginLeft: "auto" }}>
            <Link to={"/profile"}>{this.props.username}</Link>
          </Li>
        );
      }
    }
    return (
      <PaddedBody backgroundColor="red">
        <Nav>
          {output}
          {this.props.children}
        </Nav>
      </PaddedBody>
    );
  }
}
