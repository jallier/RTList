import { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import * as React from 'react';
import { io } from './App';

export interface ListBoxItemProps {
  id: string;
  text: string;
  checked: boolean;
  clickHandler: any; // This is a function passed by the parent
}

const style = {
  height: '50px',
  borderBottom: '1px solid grey',
  borderTop: '1px solid grey',
};

export class ListBoxItem extends React.Component<ListBoxItemProps> {
  constructor(props: ListBoxItemProps) {
    super(props);
    this.handleSubClick = this.handleSubClick.bind(this);
  }

  render() {
    return (
      <ListItem onClick={this.handleSubClick} style={style}>
        <Checkbox checked={this.props.checked} />
        <ListItemText primary={this.props.text} />
      </ListItem>
    );
  }
  private handleSubClick() {
    this.props.clickHandler(this.props);
  }
}