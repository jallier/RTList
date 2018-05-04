import * as React from 'react';
import * as styled from './styled-components';

type Children = JSX.Element | string;

interface HeaderProps {
  children: Children;
}

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
    return (
      <Nav>
        {this.props.children}
      </Nav>
    );
  }
}