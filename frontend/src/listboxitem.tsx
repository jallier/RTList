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

const ListItemStyle = {
  height: '50px',
  borderBottom: '1px solid grey',
  borderTop: '1px solid grey',
};

const ListItemTextStyle = {
  textDecoration: 'line-through',
};

export class ListBoxItem extends React.Component<ListBoxItemProps> {
  constructor(props: ListBoxItemProps) {
    super(props);
    this.handleSubClick = this.handleSubClick.bind(this);
  }

  render() {
    return (
      <ListItem onClick={this.handleSubClick} style={ListItemStyle}>
        <Checkbox checked={this.props.checked} />
        <ListItemText primary={this.props.text} style={this.props.checked ? ListItemTextStyle : {}} />
      </ListItem>
    );
  }
  // pass this through a method so that the arguments can be passed back up to the parent
  private handleSubClick() {
    this.props.clickHandler(this.props);
  }
}