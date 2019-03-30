import * as React from "react";
import * as uuidGenerator from "uuid/v1";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import { ListBoxItem, ListBoxItemProps } from "./listboxitem";
import { InputListItem } from "./InputListItem";
import { Socket } from "socket.io-client";
import Modal from "@material-ui/core/Modal";
import { ModalContent } from "./styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import MenuIcon from "@material-ui/icons/Menu";
import { SimpleMenu } from "./SimpleMenu";
import styled from "react-emotion";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Circle } from "./Circle";
import {
  Tooltip,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Paper
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { groupBy, map as loMap } from "lodash";
import * as moment from "moment";

const StyledList = styled(List)`
  border-top: 1px solid grey;
  padding-top: 0px;
`;

interface ListBoxProps {
  username: string;
  userId: number;
  io: SocketIOClient.Socket;
}

interface ListBoxState {
  listItems: ListItemsState[];
  input: string;
  modal: {
    confirmArchived: boolean;
  };
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

// Update these as needed
interface UpdateableListItemsState {
  text?: string;
}

export class ListBox extends React.Component<ListBoxProps, ListBoxState> {
  private io: SocketIOClient.Socket;
  constructor(props: ListBoxProps) {
    super(props);
    this.state = {
      listItems: [],
      input: "",
      modal: { confirmArchived: false }
    };
    this.io = this.props.io;

    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.handleRemoteListItemAdded = this.handleRemoteListItemAdded.bind(this);
    this.handleListItemClick = this.handleListItemClick.bind(this);
    this.handleRemoteListItemStateChange = this.handleRemoteListItemStateChange.bind(
      this
    );
    this.handleReceiveInitialState = this.handleReceiveInitialState.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleRemoteDeleteItem = this.handleRemoteDeleteItem.bind(this);
    this.handleShowLogsClick = this.handleShowLogsClick.bind(this);
    this.handleResetButtonClick = this.handleResetButtonClick.bind(this);
    this.handleCompletedButtonClick = this.handleCompletedButtonClick.bind(
      this
    );
    this.handleCompletedConfirmationButtonClick = this.handleCompletedConfirmationButtonClick.bind(
      this
    );
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleReconnect = this.handleReconnect.bind(this);
    this.handleUpdateItem = this.handleUpdateItem.bind(this);
    this.handleRemoteUpdateItem = this.handleRemoteUpdateItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);

    console.log("emitting getAll");
    this.getAllFromServer();
  }

  /**
   * Send a request to the server to fetch all the list items
   */
  private getAllFromServer() {
    this.io.emit("getAll");
  }

  /**
   * Register the socket listeners here
   */
  public componentDidMount() {
    this.io.on("receivedInitialState", this.handleReceiveInitialState);
    this.io.on("addRemoteItem", this.handleRemoteListItemAdded);
    this.io.on("checkedItem", this.handleRemoteListItemStateChange);
    this.io.on("deleteRemoteItem", this.handleRemoteDeleteItem);
    this.io.on("reconnect", this.handleReconnect);
    this.io.on("updateItem", this.handleRemoteUpdateItem);
    this.io.on("disconnect", this.handleDisconnect);
  }

  /**
   * Unregister the socket listeners here to prevent things being updated twice on remount
   */
  public componentWillUnmount() {
    this.io.off("receivedInitialState", this.handleReceiveInitialState);
    this.io.off("addRemoteItem", this.handleRemoteListItemAdded);
    this.io.off("checkedItem", this.handleRemoteListItemStateChange);
    this.io.off("deleteRemoteItem", this.handleRemoteDeleteItem);
    this.io.off("reconnect", this.handleReconnect);
    this.io.off("updateItem", this.handleRemoteUpdateItem);
    this.io.off("disconnect", this.handleDisconnect);
  }

  /**
   * Handle a disconnect from the server. Force a rerender to display this to the user
   */
  public handleDisconnect() {
    console.error("Socket closed unexpectedly");
    this.forceUpdate();
  }

  /**
   * Handle the reconnect to the socket. Send a fresh request for all the list items.
   * This will trigger a rerender when the new state is sent, updating the view with the data missed while asleep
   */
  public handleReconnect() {
    // this.forceUpdate();
    this.getAllFromServer();
  }

  public handleReceiveInitialState(listItems: ListItemsState[]) {
    console.log("Received all list items from server: ", listItems);
    this.setState({ listItems });
  }

  // TODO: make me match the other function below
  public handleRemoteListItemAdded(
    username: string,
    uuid: string,
    value: string,
    position: number
  ) {
    console.log(uuid, value, "was added by", username);
    this.setState(prevState => ({
      // TODO: FIX THIS
      listItems: this.state.listItems.concat([
        {
          uuid,
          position,
          addedBy: username,
          checked: false,
          text: value,
          archived: false
        }
      ])
    }));
  }

  /**
   * Function to be called by the input component when it is submitted. Adds the new item to the array of items in state
   * @param value new item to be added
   */
  public handleInputSubmit(value: string) {
    const uuid = uuidGenerator();
    this.io.emit("addItem", this.props.username, uuid, value);
    this.setState(prevState => ({
      // TODO: FIX THIS
      listItems: this.state.listItems.concat([
        {
          uuid,
          addedBy: this.props.username,
          checked: false,
          text: value,
          archived: false,
          position: 0
        }
      ])
    }));
  }

  /**
   * Get the highest position value from the current listItems stored in state
   */
  private getMaxPosition() {
    let max = 0;
    for (const item of this.state.listItems) {
      if (item.position > max) {
        max = item.position;
      }
    }
    return max;
  }

  // This function should invert the current checked state of the item
  public handleListItemClick(item: ListBoxItemProps) {
    const checked = !item.checked; // Reverse this as it represents the current state, not the state it was at the time
    let maxPosition = 0;
    if (checked) {
      maxPosition = this.getMaxPosition() + 100;
    }
    const newListItems = this.getUpdatedListStateItem(
      item.id,
      item.text,
      checked,
      this.props.username,
      item.archived,
      maxPosition
    );
    this.setState({ listItems: newListItems }, () => {
      // Only emit once the state has been updated.
      // This could be moved to the start of the function, left here as a reminder
      this.io.emit(
        "checkedItem",
        item.id,
        item.text,
        checked,
        this.props.username,
        this.props.userId
      );
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
  public getUpdatedListStateItem(
    uuid: string,
    text: string,
    checked: boolean,
    checkedBy: string,
    archived: boolean,
    position: number
  ) {
    console.log("Item changed", uuid, text, checked);
    const newListItems: ListItemsState[] = [];
    for (const item of this.state.listItems) {
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
        console.log(uuid, "was matched");
      }
      newListItems.push({
        addedBy: item.addedBy || this.props.username,
        uuid: item.uuid,
        text: newText,
        checked: newChecked,
        checkedBy: newCheckedBy,
        archived: newArchived,
        position: newPosition
      });
    }
    return newListItems;
  }

  public getRemovedListStateItem(uuid: string) {
    const newListItems: ListItemsState[] = [];
    for (const item of this.state.listItems) {
      if (uuid !== item.uuid) {
        newListItems.push({
          addedBy: this.props.username,
          uuid: item.uuid,
          text: item.text,
          checked: item.checked,
          archived: item.archived,
          position: item.position
        });
      }
    }
    return newListItems;
  }

  public handleRemoteListItemStateChange(
    id: string,
    text: string,
    checked: boolean,
    checkedBy: string,
    archived: boolean,
    position: number
  ) {
    const newListItems = this.getUpdatedListStateItem(
      id,
      text,
      checked,
      checkedBy,
      archived,
      position
    );
    this.setState({ listItems: newListItems });
  }

  public handleRemoteDeleteItem(id: string) {
    console.log(id, "deleting id");
    const newListItems = this.getRemovedListStateItem(id);
    this.setState({ listItems: newListItems });
  }

  public handleDeleteItemClick(id: string) {
    console.log(id, "delete button was clicked");
    this.io.emit("deleteItem", id);
    this.handleRemoteDeleteItem(id);
  }

  /**
   * Function to send an update to the server when a listitems text is edited
   *
   * @param id id of the item to update
   * @param text text to update the item to
   */
  public handleUpdateItem(item: ListBoxItemProps) {
    console.log(item.id, "item was updated to ", item.text);
    this.io.emit("updateItem", item.id, item.text);
  }

  /**
   * Apply remote changes to local items
   *
   * @param uuid uuid of the item to update
   * @param text text the item was updated to
   */
  public handleRemoteUpdateItem(uuid: string, text: string) {
    console.log(uuid, "was updated to", text);
    this.updateItem(uuid, { text });
  }

  /**
   * Update an item in the listitemsstate
   *
   * @param uuid id of the item to update
   * @param args args of the item to update
   */
  public updateItem(uuid: string, args: UpdateableListItemsState) {
    const { listItems } = this.state;
    const index = listItems.findIndex(i => i.uuid === uuid);
    const item = listItems[index];
    const newItem = { ...item, ...args };
    listItems.splice(index, 1, newItem);
    this.setState({ listItems });
  }

  public handleResetButtonClick(e: React.SyntheticEvent<any>) {
    // Remove this or make it hidden later
    this.io.emit("resetList");
  }

  public handleShowLogsClick(e: React.SyntheticEvent<any>) {
    this.io.emit("showLogs");
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
      this.io.emit("completedList", this.props.userId);
    });
  }

  public handleModalClose(e: React.SyntheticEvent<any>) {
    this.setState({ modal: { confirmArchived: false } });
  }

  /**
   * Split the state list into archived and live list for display purposes
   *
   * @param items List of items to split
   */
  private splitLists(items: ListItemsState[]) {
    const archivedList: ListItemsState[] = [];
    const liveList: ListItemsState[] = [];
    for (const item of items) {
      if (item.archived) {
        archivedList.push(item);
      } else {
        liveList.push(item);
      }
    }
    return { archivedList, liveList };
  }

  /**
   * Put the list of live items into order based on position value. Order the list in-place
   *
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

  /**
   * Group items into subarrays by date
   *
   * @param items Items to group
   */
  private groupArchivedByDate(items: ListItemsState[]) {
    let result = groupBy(items, (value: any) => {
      const date = moment(value.updatedAt);
      const weekString = `${date
        .startOf("week")
        .format("MMM Do")} - ${date.endOf("week").format("MMM Do")}`;
      return weekString;
    });
    return result;
  }

  render() {
    let items = this.splitLists(this.state.listItems);
    this.orderLiveList(items.liveList);
    let groupedArchivedItems = this.groupArchivedByDate(items.archivedList);
    return (
      <div>
        <header>
          <Typography variant="h3">
            <SimpleMenu
              menuItems={[
                // { text: 'Reset List', callback: this.handleResetButtonClick },
                {
                  text: "Send active items to archive",
                  callback: this.handleCompletedConfirmationButtonClick
                }
              ]}
            >
              <MenuIcon />
            </SimpleMenu>
            List
            <Button onClick={this.handleReconnect}>
              <RefreshIcon />
            </Button>
            <Tooltip title="If this is red, refresh the whole page to try reconnect">
              <span>
                {/* Need a span here to make the tooltip work */}
                <Circle
                  radius={10}
                  strokeWidth={3}
                  colour={this.io.connected ? "green" : "red"}
                />
              </span>
            </Tooltip>
          </Typography>
        </header>
        <div>
          <Paper style={{ padding: "20px" }}>
            <InputListItem
              label="Add Item, press Enter to save"
              width="100%"
              handleSubmit={this.handleInputSubmit}
            />
            {items.liveList.map(item => (
              <ListBoxItem
                addedBy={item.addedBy}
                text={item.text}
                id={item.uuid}
                key={item.uuid + item.text}
                checked={item.checked}
                checkedBy={item.checkedBy}
                checkedClickHandler={this.handleListItemClick}
                deletedClickHandler={this.handleDeleteItemClick}
                updatedHandler={this.handleUpdateItem}
                archived={item.archived}
                position={item.position}
              />
            ))}
          </Paper>
          <h3>Archived</h3>
          {loMap(groupedArchivedItems, (itemArr, key) => {
            return (
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                  {key}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ display: "block" }}>
                  {itemArr.map(item => (
                    <ListBoxItem
                      addedBy={item.addedBy}
                      text={item.text}
                      id={item.uuid}
                      key={item.uuid}
                      checked={item.checked}
                      checkedBy={item.checkedBy}
                      checkedClickHandler={this.handleListItemClick}
                      deletedClickHandler={this.handleDeleteItemClick}
                      updatedHandler={this.handleUpdateItem}
                      archived={item.archived}
                      position={0}
                    />
                  ))}
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
          {/* Modal code */}
          <Modal
            open={this.state.modal.confirmArchived}
            onClose={this.handleModalClose}
          >
            <div
              style={{
                position: "absolute",
                backgroundColor: "white",
                boxShadow: "5px",
                padding: "22px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)"
              }}
            >
              <Typography variant="h6">
                Are you sure you want to archive all items?
              </Typography>
              <Typography variant="subtitle1">
                Warning! This action cannot be undone!
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingTop: "22px"
                }}
              >
                <Button onClick={this.handleModalClose}>Cancel</Button>
                <span style={{ width: "10px" }} /> {/** What a hack */}
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.handleCompletedButtonClick}
                >
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
