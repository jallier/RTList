import * as React from 'react';
import { handleSocket } from './App';
import { io } from './App';
import List from 'material-ui/List';
import { ListBoxItem } from './listboxitem';
import { InputForm } from './InputForm';

interface ListItemProps {
  text: string;
}

interface ListItemsState {
  checked: boolean;
  text: string;
}

interface ListBoxState {
  text: string;
  listItems: ListItemsState[];
  input: string;
}

export class ListBox extends React.Component<ListItemProps, ListBoxState> {
  constructor(props: ListItemProps) {
    super(props);
    handleSocket();
    this.state = { text: this.props.text, listItems: [{ checked: false, text: 'test' }], input: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  // tslint:disable-next-line:no-any
  public handleSubmit(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    // tslint:disable-next-line:no-console
    console.log(this.state.input);
    io.emit('addItem', this.state.input);
    this.setState(prevState => ({
      listItems: this.state.listItems.concat([{checked: false, text: this.state.input}]),
    }));
    e.currentTarget.reset();
  }
  // tslint:disable-next-line:no-any
  public handleChange(e: React.SyntheticEvent<any>) {
    this.setState({ input: e.currentTarget.value });
  }

  render() {
    return (
      <div>
        <div>This is a test {this.props.text}</div>
        <div>
          <List>
            <ListBoxItem text="ayy lmao" />
            <ListBoxItem text="List item number 2" />
            {
              this.state.listItems.map((item) => (
                <ListBoxItem text={item.text} />
              ))
            }
          </List>
          <InputForm handleSubmit={this.handleSubmit} handleChange={this.handleChange}/>
        </div>
      </div>
    );
  }
}