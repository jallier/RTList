import * as React from 'react';
import * as uuidGenerator from 'uuid/v1';
import List from 'material-ui/List';
import Button from 'material-ui/Button';
import { ListBoxItem, ListBoxItemProps } from './listboxitem';
import { InputForm } from './InputForm';
import { Socket } from 'socket.io-client';
import Modal from 'material-ui/Modal';
import { ModalContent } from './styles';
import Typography from 'material-ui/Typography';

interface ListBoxProps {
  text: string;
  username: string;
  userId: number;
  io: SocketIOClient.Socket;
}

interface ListItemsState {
  addedBy: string;
  uuid: string;
  checked: boolean;
  checkedBy?: string;
  checkedById?: number;
  text: string;
  archived: boolean;
  position: number;
}

interface ListBoxState {
  text: string;
  listItems: ListItemsState[];
  input: string;
  modal: {
    confirmArchived: boolean;
  };
}

export class ListBox extends React.Component<ListBoxProps, ListBoxState> {
  private io: SocketIOClient.Socket;
  constructor(props: ListBoxProps) {
    super(props);
    // tslint:disable-next-line:max-line-length
    this.state = { text: this.props.text, listItems: [], input: '', modal: { confirmArchived: false } };
    this.io = this.props.io;

    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRemoteListItemAdded = this.handleRemoteListItemAdded.bind(this);
    this.handleListItemClick = this.handleListItemClick.bind(this);
    this.handleRemoteListItemStateChange = this.handleRemoteListItemStateChange.bind(this);
    this.handleReceiveInitialState = this.handleReceiveInitialState.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleRemoteDeleteItem = this.handleRemoteDeleteItem.bind(this);
    this.handleShowLogsClick = this.handleShowLogsClick.bind(this);
    this.handleResetButtonClick = this.handleResetButtonClick.bind(this);
    this.handleCompletedButtonClick = this.handleCompletedButtonClick.bind(this);
    this.handleCompletedConfirmationButtonClick = this.handleCompletedConfirmationButtonClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);

    console.log('emitting getAll');
    this.io.emit('getAll');
  }

  /**
   * Register the socket listeners here
   */
  public componentDidMount() {
    this.io.on('receivedInitialState', this.handleReceiveInitialState);
    this.io.on('addRemoteItem', this.handleRemoteListItemAdded);
    this.io.on('checkedItem', this.handleRemoteListItemStateChange);
    this.io.on('deleteRemoteItem', this.handleRemoteDeleteItem);
  }

  /**
   * Unregister the socket listeners here to prevent things being updated twice on remount
   */
  public componentWillUnmount() {
    this.io.off('receivedInitialState', this.handleReceiveInitialState);
    this.io.off('addRemoteItem', this.handleRemoteListItemAdded);
    this.io.off('checkedItem', this.handleRemoteListItemStateChange);
    this.io.off('deleteRemoteItem', this.handleRemoteDeleteItem);
  }

  public handleReceiveInitialState(listItems: ListItemsState[]) {
    console.log('Received all list items from server: ', listItems);
    this.setState({ listItems });
  }

  // TODO: make me match the other function below
  public handleRemoteListItemAdded(username: string, uuid: string, value: string, position: number) {
    console.log(uuid, value, 'was added by', username);
    this.setState(prevState => ({
      // TODO: FIX THIS
      listItems: this.state.listItems.concat([{ addedBy: username, uuid, checked: false, text: value, archived: false, position }]),
    }));
  }

  public handleInputSubmit(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    console.log(this.state.input);
    let uuid = uuidGenerator();
    this.io.emit('addItem', this.props.username, uuid, this.state.input);
    this.setState(prevState => ({
      // TODO: FIX THIS
      listItems: this.state.listItems.concat([{ addedBy: this.props.username, uuid, checked: false, text: this.state.input, archived: false, position: 0 }]),
    }));
    e.currentTarget.reset();
  }

  public handleInputChange(e: React.SyntheticEvent<any>) {
    this.setState({ input: e.currentTarget.value });
  }

  /**
   * Get the highest position value from the current listItems stored in state
   */
  private getMaxPosition() {
    let max = 0;
    for (let item of this.state.listItems) {
      if (item.position > max) {
        max = item.position;
      }
    }
    return max;
  }

  // This function should invert the current checked state of the item
  public handleListItemClick(e: ListBoxItemProps) {
    let checked = !e.checked; // Reverse this as it represents the current state, not the state it was at the time
    let maxPosition = 0;
    if (checked) {
      maxPosition = this.getMaxPosition() + 100;
    }
    let newListItems = this.getUpdatedListStateItem(e.id, e.text, checked, this.props.username, e.archived, maxPosition);
    this.setState({ listItems: newListItems }, () => {
      // Only emit once the state has been updated. 
      // This could be moved to the start of the function, left here as a reminder
      this.io.emit('checkedItem', e.id, e.text, checked, this.props.username, this.props.userId);
    });
  }

  // TODO: Rework these two functions to just modify/remove the items in place instead of making a new array
  /**
   * This function will check the items in the state and update the matching item based on the uuid
   * @param uuid ID to match item in state against 
   * @param text Text of the item
   * @param checked If the item should be checked or not
   * @param checkedBy The username of the user who checked the item
   * @param archived If the item has been archived
   */
  public getUpdatedListStateItem(uuid: string, text: string, checked: boolean, checkedBy: string, archived: boolean, position: number) {
    console.log('Item changed', uuid, text, checked);
    let newListItems: ListItemsState[] = [];
    for (let item of this.state.listItems) {
      let newText = item.text;
      let newChecked = item.checked;
      let newCheckedBy = item.checkedBy;
      let newArchived = item.archived;
      let newPosition = item.position;
      if (item.uuid === uuid) {
        newText = text;
        newChecked = checked;
        newCheckedBy = checkedBy || this.props.username;
        newArchived = false;
        newPosition = position;
        console.log(uuid, 'was matched');
      }
      newListItems.push({ addedBy: item.addedBy || this.props.username, uuid: item.uuid, text: newText, checked: newChecked, checkedBy: newCheckedBy, archived: newArchived, position: newPosition });
    }
    return newListItems;
  }

  public getRemovedListStateItem(uuid: string) {
    let newListItems: ListItemsState[] = [];
    for (let item of this.state.listItems) {
      if (uuid !== item.uuid) {
        newListItems.push({ addedBy: this.props.username, uuid: item.uuid, text: item.text, checked: item.checked, archived: item.archived, position: item.position });
      }
    }
    return newListItems;
  }

  public handleRemoteListItemStateChange(id: string, text: string, checked: boolean, checkedBy: string, archived: boolean, position: number) {
    let newListItems = this.getUpdatedListStateItem(id, text, checked, checkedBy, archived, position);
    this.setState({ listItems: newListItems });
  }

  public handleRemoteDeleteItem(id: string) {
    console.log(id, 'deleting id');
    let newListItems = this.getRemovedListStateItem(id);
    this.setState({ listItems: newListItems });
  }

  public handleDeleteItemClick(id: string) {
    console.log(id, 'delete button was clicked');
    this.io.emit('deleteItem', id);
    this.handleRemoteDeleteItem(id);
  }

  public handleResetButtonClick(e: React.SyntheticEvent<any>) {
    // Remove this or make it hidden later
    this.io.emit('resetList');
  }

  public handleShowLogsClick(e: React.SyntheticEvent<any>) {
    this.io.emit('showLogs');
  }

  /**
   * Function to show the modal popup for confirming the archive button click
   * @param e Event
   */
  public handleCompletedConfirmationButtonClick(e: React.SyntheticEvent<any>) {
    this.setState({ modal: { confirmArchived: true } });
  }

  /**
   * Function to handle the archive button confirmed click
   * @param e Event
   */
  public handleCompletedButtonClick(e: React.SyntheticEvent<any>) {
    this.setState({ modal: { confirmArchived: false } }, () => {
      this.io.emit('completedList', this.props.userId);
    });
  }

  public handleModalClose(e: React.SyntheticEvent<any>) {
    this.setState({ modal: { confirmArchived: false } });
  }

  /**
   * Split the state list into archived and live list for display purposes
   * @param items List of items to split
   */
  private splitLists(items: ListItemsState[]) {
    let archivedList: ListItemsState[] = [];
    let liveList: ListItemsState[] = [];
    for (let item of items) {
      if (item.archived) {
        archivedList.push(item);
      } else {
        liveList.push(item);
      }
    }
    return { archivedList, liveList };
  }

  /**
   * Put the list of live items into order based on position value
   * @param items Items to sort
   */
  private orderLiveList(items: ListItemsState[]) {
    items.sort((a, b) => {
      if (a.position > b.position) {
        return 1;
      } else if (a.position < b.position) {
        return -1;
      }
      return 0;
    });
  }

  render() {
    let items = this.splitLists(this.state.listItems);
    this.orderLiveList(items.liveList);
    return (
      <div>
        <div>This is a test {this.props.text}</div>
        <div>
          <List>
            {
              items.liveList.map((item) => (
                // tslint:disable-next-line:max-line-length
                <ListBoxItem addedBy={item.addedBy} text={item.text} id={item.uuid} key={item.uuid} checked={item.checked} checkedBy={item.checkedBy} checkedClickHandler={this.handleListItemClick} deletedClickHandler={this.handleDeleteItemClick} archived={item.archived} position={0} />
              ))
            }
          </List>
          <h3>
            Archived
          </h3>
          <List>
            {
              items.archivedList.map((item) => (
                // tslint:disable-next-line:max-line-length
                <ListBoxItem addedBy={item.addedBy} text={item.text} id={item.uuid} key={item.uuid} checked={item.checked} checkedBy={item.checkedBy} checkedClickHandler={this.handleListItemClick} deletedClickHandler={this.handleDeleteItemClick} archived={item.archived} position={0} />
              ))
            }
          </List>
          <InputForm handleSubmit={this.handleInputSubmit} handleChange={this.handleInputChange} />
          <Button variant="raised" color="secondary" onClick={this.handleResetButtonClick}>
            Reset List
          </Button>
          <Button variant="raised" color="secondary" style={{ margin: '5px' }} onClick={this.handleCompletedConfirmationButtonClick}>
            Send all to Archive
          </Button>
          <Button variant="raised" color="secondary" onClick={this.handleShowLogsClick}>
            Show logs in console
          </Button>

          <Modal open={this.state.modal.confirmArchived} onClose={this.handleModalClose}>
            <div style={{ position: 'absolute', backgroundColor: 'white', boxShadow: '5px', padding: '22px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <Typography variant="title">
                Are you sure you want to archive all items?
              </Typography>
              <Typography variant="subheading">
                Warning! This action cannot be undone!
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '22px' }}>
                <Button onClick={this.handleModalClose}>
                  Cancel
                </Button>
                <span style={{ width: '10px' }} /> {/** What a hack */}
                <Button color="primary" variant="raised" onClick={this.handleCompletedButtonClick}>
                  Archive
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}
