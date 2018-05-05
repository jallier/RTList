import * as React from 'react';
import * as styled from './styled-components';
import { Link } from 'react-router-dom';

type Children = JSX.Element[]; // | JSX.Element | string;

interface HeaderProps {
  children?: Children;
  links?: { to: string, text: string }[];
}

const Li = styled.default.li`
  display: inline-block;
  padding-right: 5px;
`;

const Nav = styled.default.nav`
  width: 100%;
  height: 50px;
  background-color: red;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export class Header extends React.Component<HeaderProps> {

  public render() {
    // Render the links properly
    let output = [];
    if (this.props.links) {
      let len = this.props.links.length;
      for (let i = 0; i < len; i++) {
        if (i < len - 1) {
          output.push(<Li key={i}><Link to={this.props.links[i].to}>{this.props.links[i].text}</Link>{'\u00A0'}|</Li>);
        } else {
          output.push(<Li key={i}><Link to={this.props.links[i].to}>{this.props.links[i].text}</Link></Li>);
        }
      }
    }
    return (
      <Nav>
        <ul>
          {output}
        </ul>
        {this.props.children}
      </Nav>
    );
  }
}