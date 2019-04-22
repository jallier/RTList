import * as React from "react";
import * as uuidGenerator from "uuid/v1";
import Button from "@material-ui/core/Button";
import { ListBoxItem, ListBoxItemProps } from "./listboxitem";
import { InputListItem } from "./InputListItem";
import Modal from "@material-ui/core/Modal";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import { SimpleMenu } from "./SimpleMenu";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Circle } from "./Circle";
import { Tooltip, Paper, AppBar, Tabs, Tab } from "@material-ui/core";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Item } from "../lib/types";
import { createItem, updateItem, deleteItem } from "../store/items/actions";
import { AppState } from "../store";

interface ListBoxProps {
  username: string;
  userId: number;
  io: SocketIOClient.Socket;
  liveItems: Item[];
  createItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (itemUuid: string) => void;
}

interface ListBoxState {
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

export class LiveItems extends React.Component<ListBoxProps, ListBoxState> {
  private io: SocketIOClient.Socket;
  constructor(props: ListBoxProps) {
    super(props);
    this.state = {
      modal: { confirmArchived: false }
    };
    this.io = this.props.io;

    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.handleListItemClick = this.handleListItemClick.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleShowLogsClick = this.handleShowLogsClick.bind(this);
    this.handleResetButtonClick = this.handleResetButtonClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleReconnect = this.handleReconnect.bind(this);
    this.handleUpdateItem = this.handleUpdateItem.bind(this);
    this.handleCompletedButtonClick = this.handleCompletedButtonClick.bind(
      this
    );
    this.handleCompletedConfirmationButtonClick = this.handleCompletedConfirmationButtonClick.bind(
      this
    );
  }

  /**
   * Function to be called by the input component when it is submitted. Adds the new item to the array of items in state
   * @param value new item to be added
   */
  public handleInputSubmit(value: string) {
    const uuid = uuidGenerator();
    this.io.emit("addItem", this.props.username, uuid, value);
    this.props.createItem({
      addedBy: this.props.username,
      archived: false,
      checked: false,
      position: 0,
      text: value,
      uuid
    });
  }

  /**
   * Get the highest position value from the current listItems stored in state
   */
  private getMaxPosition(items: Item[]) {
    let max = 0;
    for (const item of items) {
      if (item.position > max) {
        max = item.position;
      }
    }
    return max;
  }

  /**
   * Handle when an item in the list is clicked. Update the state and emit a socket event
   * @param item The item that was clicked
   */
  public handleListItemClick(item: ListBoxItemProps) {
    const checked = !item.checked; // Reverse this as it represents the current state, not the state it was at the time
    let maxPosition = 0;
    if (checked) {
      maxPosition = this.getMaxPosition(this.props.liveItems) + 100;
    }
    this.props.updateItem({
      uuid: item.id,
      addedBy: item.addedBy,
      archived: item.archived,
      checked,
      checkedBy: this.props.username,
      position: maxPosition,
      text: item.text
    });
    this.io.emit(
      "checkedItem",
      item.id,
      item.text,
      checked,
      this.props.username,
      this.props.userId
    );
  }

  /**
   * Handle when the delete button is clicked on an item
   * @param uuid uuid of the item to delete
   */
  public handleDeleteItemClick(uuid: string) {
    console.log(uuid, "delete button was clicked");
    this.io.emit("deleteItem", uuid);
    this.props.deleteItem(uuid);
  }

  /**
   * Function to send an update to the server when a listitems text is edited
   *
   * @param id id of the item to update
   * @param text text to update the item to
   */
  public handleUpdateItem(item: ListBoxItemProps) {
    console.log(item.id, "item was updated to ", item.text);
    this.props.updateItem({
      addedBy: item.addedBy,
      archived: item.archived,
      checked: item.checked,
      position: item.position,
      text: item.text,
      uuid: item.id
    });
    this.io.emit("updateItem", item.id, item.text);
  }

  /**
   * Handle the reconnect to the socket. Send a fresh request for all the list items.
   * This will trigger a rerender when the new state is sent, updating the view with the data missed while asleep
   */
  public handleReconnect() {
    this.getAllFromServer();
  }

  /**
   * Send a request to the server to fetch all the list items
   */
  private getAllFromServer() {
    this.props.io.emit("getAll");
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
   * Put the list of live items into order based on position value. Order the list in-place
   *
   * @param items Items to sort
   */
  private orderLiveList(items: ListItemsState[]) {
    const newItems = items.slice();
    newItems.sort((a, b) => {
      if (a.position > b.position) {
        return 1;
      } else if (a.position < b.position) {
        return -1;
      }
      return 0;
    });
    return newItems;
  }

  render() {
    const items = this.orderLiveList(this.props.liveItems);
    return (
      <React.Fragment>
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
            {items.map(item => (
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
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  const { liveItems } = state.items;
  return {
    liveItems
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    createItem: (item: Item) => dispatch(createItem(item)),
    updateItem: (item: Item) => dispatch(updateItem(item)),
    deleteItem: (itemUuid: string) => dispatch(deleteItem(itemUuid))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LiveItems);
