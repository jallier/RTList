import * as React from 'react';
import { handleSocket } from './App';
import { io } from './App';
import List from 'material-ui/List';
import { ListBoxItem } from './listboxitem';

interface ListItemProps {
  text: string;
}

interface ListBoxState {
  text: string;
  listItems: {}[];
}

export class ListBox extends React.Component<ListItemProps, ListBoxState> {
  constructor(props: ListItemProps) {
    super(props);
    handleSocket();
    this.state = { text: this.props.text, listItems: [] };
  }

  render() {
    return (
      <div>
        <div>This is a test {this.props.text}</div>
        <div>
          <List>
            <ListBoxItem text="ayy lmao" />
            <ListBoxItem text="List item number 2" />
          </List>
        </div>
      </div>
    );
  }
}