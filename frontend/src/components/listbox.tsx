import * as React from 'react';
import * as uuidGenerator from 'uuid/v1';
import { io } from './App';
import List from 'material-ui/List';
import Button from 'material-ui/Button';
import { ListBoxItem, ListBoxItemProps } from './listboxitem';
import { InputForm } from './InputForm';

interface ListBoxProps {
  text: string;
}

interface ListItemsState {
  uuid: string;
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

    io.emit('getAll');
  }

  /**
   * Register the socket listeners here
   */
  public componentDidMount() {
    io.on('receivedInitialState', this.handleReceiveInitialState);
    io.on('addRemoteItem', this.handleRemoteListItemAdded);
    io.on('checkedItem', this.handleRemoteListItemStateChange);
    io.on('deleteRemoteItem', this.handleRemoteDeleteItem);
  }

  /**
   * Unregister the socket listeners here to prevent things being updated twice on remount
   */
  public componentWillUnmount() {
    io.off('receivedInitialState', this.handleReceiveInitialState);
    io.off('addRemoteItem', this.handleRemoteListItemAdded);
    io.off('checkedItem', this.handleRemoteListItemStateChange);
    io.off('deleteRemoteItem', this.handleRemoteDeleteItem);
  }

  public handleReceiveInitialState(listItems: ListItemsState[]) {
    console.log('List items', listItems);
    this.setState({ listItems });
  }

  // TODO: make me match the other function below
  public handleRemoteListItemAdded(uuid: string, value: string) {
    console.log(uuid, value, 'was added');
    this.setState(prevState => ({
      listItems: this.state.listItems.concat([{ uuid, checked: false, text: value }]),
    }));
  }

  public handleInputSubmit(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    console.log(this.state.input);
    let uuid = uuidGenerator();
    io.emit('addItem', uuid, this.state.input);
    this.setState(prevState => ({
      listItems: this.state.listItems.concat([{ uuid, checked: false, text: this.state.input }]),
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
      io.emit('checkedItem', e.id, e.text, !e.checked);
    });
  }

  // TODO: Rework these two functions to just modify/remove the items in place instead of making a new array
  public getUpdatedListStateItem(uuid: string, text: string, checked: boolean) {
    console.log(uuid, text, checked);
    let newListItems: ListItemsState[] = [];
    for (let item of this.state.listItems) {
      let newText = item.text;
      let newChecked = item.checked;
      if (item.uuid === uuid) {
        newText = text;
        newChecked = checked;
        console.log(uuid, 'was matched');
      }
      newListItems.push({ uuid: item.uuid, text: newText, checked: newChecked });
    }
    return newListItems;
  }

  public getRemovedListStateItem(uuid: string) {
    let newListItems: ListItemsState[] = [];
    for (let item of this.state.listItems) {
      if (uuid !== item.uuid) {
        newListItems.push({ uuid: item.uuid, text: item.text, checked: item.checked });
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
                <ListBoxItem text={item.text} id={item.uuid} key={item.uuid} checked={item.checked} checkedClickHandler={this.handleListItemClick} deletedClickHandler={this.handleDeleteItemClick} />
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