import { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import * as React from 'react';
import { io } from './App';

interface ListItemProps {
  text: string;
}

interface ListItemState {
  checked?: boolean;
  text: string;
}

const style = {
  backgroundColor: 'blue'
};

const listItemStyle = {
  
};

// tslint:disable-next-line:no-any
export class ListBoxItem extends React.Component<ListItemProps, ListItemState> {
  // tslint:disable-next-line:no-any
  constructor(props: any) {
    super(props);
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
      <ListItem onClick={this.handleClick} style={style}>
        <Checkbox />
        <ListItemText primary={this.state.text} />
      </ListItem>
    );
  }
}