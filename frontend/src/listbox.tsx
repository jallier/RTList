import * as React from 'react';
import * as uuid from 'uuid/v1';
import { handleSocket } from './App';
import { io } from './App';
import List from 'material-ui/List';
import { ListBoxItem } from './listboxitem';
import { InputForm } from './InputForm';

interface ListItemProps {
  text: string;
}

interface ListItemsState {
  id: string;
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
    this.handleListRemoteStateChange();
    // tslint:disable-next-line:max-line-length
    this.state = { text: this.props.text, listItems: [{ id: uuid(), checked: false, text: 'This test comes from the state. Added in the constructor' }], input: '' };

    io.on('click', (id: string, text: string, checked: boolean) => {
      let a = 1;
    });

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleListRemoteStateChange = this.handleListRemoteStateChange.bind(this);
  }

  public handleListRemoteStateChange() {
    io.on('addRemoteItem', (id: string, value: string) => {
      // tslint:disable-next-line:no-console
      console.log(id, value);
      this.setState(prevState => ({
        listItems: this.state.listItems.concat([{ id, checked: false, text: value }]),
      }));
    });
  }

  // tslint:disable-next-line:no-any
  public handleSubmit(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    // tslint:disable-next-line:no-console
    console.log(this.state.input);
    let id = uuid();
    io.emit('addItem', id, this.state.input);
    this.setState(prevState => ({
      listItems: this.state.listItems.concat([{ id, checked: false, text: this.state.input }]),
    }));
    e.currentTarget.reset();
  }
  // tslint:disable-next-line:no-any
  public handleChange(e: React.SyntheticEvent<any>) {
    this.setState({ input: e.currentTarget.value });
  }

  // tslint:disable-next-line:no-any
  public handleClick(e: React.SyntheticEvent<any>) {
    let a = 1;
  }

  render() {
    return (
      <div>
        <div>This is a test {this.props.text}</div>
        <div>
          <List>
            {
              this.state.listItems.map((item) => (
                <ListBoxItem text={item.text} id={item.id} key={item.id} />
              ))
            }
          </List>
          <InputForm handleSubmit={this.handleSubmit} handleChange={this.handleChange} />
        </div>
      </div>
    );
  }
}