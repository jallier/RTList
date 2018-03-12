import * as React from 'react';
import * as styled from './styled-components';

interface ListItemProps {
  text: string;
}

const Li = styled.default.li`
  color: blue;
  border: 1px solid black;
  width: auto;
`;
// tslint:disable-next-line:no-any
export class ListItem extends React.Component<ListItemProps, any> {
  // tslint:disable-next-line:no-any
  constructor(props: ListItemProps) {
    super(props);
  }

  render() {
    return (
      <Li>{this.props.text}</Li>
    );
  }
}