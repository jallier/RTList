import * as React from 'react';
import { handleSocket } from './App';
import { io } from './App';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

interface ListItemProps {
  text: string;
}

export class ListBox extends React.Component<ListItemProps, ListItemProps> {
  // tslint:disable-next-line:no-any
  constructor(props: ListItemProps) {
    super(props);
    handleSocket();
    this.state = { text: this.props.text };

    io.on('click', (msg: string) => {
      this.setState({ text: msg });
    });

    this.handleClick = this.handleClick.bind(this);
  }

  public handleClick() {
    io.emit('click', 'This is a click message');
  }

  render() {
    return (
      <div>
        <div>This is a test {this.props.text}</div>
        <div>
          <List>
            <ListItem onClick={this.handleClick}>
              <Checkbox />
              <ListItemText primary={this.state.text} />
            </ListItem>
          </List>
        </div>
      </div>
    );
  }
}