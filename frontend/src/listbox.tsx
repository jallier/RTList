import * as React from 'react';
import { handleSocket } from './api';
import { ListItem } from './list-item';
import * as styled from './styled-components';

const Ul = styled.default.ul`
  width: 800px;
`;

export class ListBox extends React.Component {
  state = { message: 'test' };
  // tslint:disable-next-line:no-any
  constructor(props: React.Props<any>) {
    super(props);
    handleSocket();
  }
  render() {
    return (
      <div>
        <div>This is a test: {this.state.message}</div>
        <Ul>
          <ListItem text="This is a test ayyy"/>
        </Ul>
      </div>
    );
  }
}