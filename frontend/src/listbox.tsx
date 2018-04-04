import * as React from 'react';
import * as uuid from 'uuid/v1';
import { handleSocket } from './App';
import { io } from './App';
import List from 'material-ui/List';
import Button from 'material-ui/Button';
import { ListBoxItem, ListBoxItemProps } from './listboxitem';
import { InputForm } from './InputForm';

interface ListBoxProps {
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

export class ListBox extends React.Component<ListBoxProps, ListBoxState> {
  constructor(props: ListBoxProps) {
    super(props);
    this.handleRemoteListItemAdded();
    // tslint:disable-next-line:max-line-length
    this.state = { text: this.props.text, listItems: [], input: '' };

    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRemoteListItemAdded = this.handleRemoteListItemAdded.bind(this);
    this.handleListItemClick = this.handleListItemClick.bind(this);
    this.handleRemoteListItemStateChange = this.handleRemoteListItemStateChange.bind(this);
    this.handleReceiveInitialState = this.handleReceiveInitialState.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleRemoteDeleteItem = this.handleRemoteDeleteItem.bind(this);

    io.on('receivedInitialState', this.handleReceiveInitialState);
    io.on('click', this.handleRemoteListItemStateChange);
    io.on('deleteRemoteItem', this.handleRemoteDeleteItem);
  }

  public handleReceiveInitialState(listItems: ListItemsState[]) {
    this.setState({ listItems });
  }

  // TODO: make me match the other function below
  public handleRemoteListItemAdded() {
    io.on('addRemoteItem', (id: string, value: string) => {
      console.log(id, value, 'was added');
      this.setState(prevState => ({
        listItems: this.state.listItems.concat([{ id, checked: false, text: value }]),
      }));
    });
  }

  public handleInputSubmit(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    console.log(this.state.input);
    let id = uuid();
    io.emit('addItem', id, this.state.input);
    this.setState(prevState => ({
      listItems: this.state.listItems.concat([{ id, checked: false, text: this.state.input }]),
    }));
    e.currentTarget.reset();
  }

  public handleInputChange(e: React.SyntheticEvent<any>) {
    this.setState({ input: e.currentTarget.value });
  }

  // This function should invert the current checked state of the item
  public handleListItemClick(e: ListBoxItemProps) {
    let newListItems = this.getUpdatedListStateItem(e.id, e.text, !e.checked);
    this.setState({ listItems: newListItems }, () => {
      // Only emit once the state has been updated. 
      // This could be moved to the start of the function, left here as a reminder
      io.emit('click', e.id, e.text, !e.checked);
    });
  }

  // TODO: Rework these two functions to just modify/remove the items in place instead of making a new array
  public getUpdatedListStateItem(id: string, text: string, checked: boolean) {
    console.log(id, text, checked);
    let newListItems: ListItemsState[] = [];
    for (let item of this.state.listItems) {
      let newText = item.text;
      let newChecked = item.checked;
      if (item.id === id) {
        newText = text;
        newChecked = checked;
        console.log(id, 'was matched');
      }
      newListItems.push({ id: item.id, text: newText, checked: newChecked });
    }
    return newListItems;
  }

  public getRemovedListStateItem(id: string) {
    let newListItems: ListItemsState[] = [];
    for (let item of this.state.listItems) {
      if (id !== item.id) {
        newListItems.push({ id: item.id, text: item.text, checked: item.checked });
      }
    }
    return newListItems;
  }

  public handleRemoteListItemStateChange(id: string, text: string, checked: boolean) {
    let newListItems = this.getUpdatedListStateItem(id, text, checked);
    this.setState({ listItems: newListItems });
  }

  public handleRemoteDeleteItem(id: string) {
    console.log(id, 'deleting id');
    let newListItems = this.getRemovedListStateItem(id);
    this.setState({ listItems: newListItems });
  }

  public handleDeleteItemClick(id: string) {
    console.log(id, 'delete button was clicked');
    io.emit('deleteItem', id);
    this.handleRemoteDeleteItem(id);
  }

  public handleResetButtonClick(e: React.SyntheticEvent<any>) {
    // Remove this or make it hidden later
    io.emit('resetList');
  }

  public handleShowLogsClick(e: React.SyntheticEvent<any>) {
    io.emit('showLogs');
  }

  render() {
    return (
      <div>
        <div>This is a test {this.props.text}</div>
        <div>
          <List>
            {
              this.state.listItems.map((item) => (
                // tslint:disable-next-line:max-line-length
                <ListBoxItem text={item.text} id={item.id} key={item.id} checked={item.checked} checkedClickHandler={this.handleListItemClick} deletedClickHandler={this.handleDeleteItemClick} />
              ))
            }
          </List>
          <InputForm handleSubmit={this.handleInputSubmit} handleChange={this.handleInputChange} />
          <Button variant="raised" color="secondary" onClick={this.handleResetButtonClick}>
            Reset List
          </Button>
          <Button variant="raised" color="secondary" onClick={this.handleShowLogsClick}>
            Show logs in console
          </Button>
        </div>
      </div>
    );
  }
}