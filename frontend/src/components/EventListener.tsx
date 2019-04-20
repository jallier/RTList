import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ListBox from "./LiveItems";
import { Item } from "../lib/types";
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem
} from "../store/items/actions";
import { List } from "./List";

interface EventListenerProps {
  username: string;
  userId: number;
  io: SocketIOClient.Socket;
  createAllItems: (items: Item[]) => void;
  createItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (uuid: string) => void;
}

export class EventListener extends React.Component<EventListenerProps> {
  constructor(props: EventListenerProps) {
    super(props);

    this.handleRemoteListItemAdded = this.handleRemoteListItemAdded.bind(this);
    this.handleRemoteListItemStateChange = this.handleRemoteListItemStateChange.bind(
      this
    );
    this.handleReceiveInitialState = this.handleReceiveInitialState.bind(this);
    this.handleRemoteDeleteItem = this.handleRemoteDeleteItem.bind(this);
    this.handleRemoteUpdateItem = this.handleRemoteUpdateItem.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);

    this.getAllFromServer();
  }

  /**
   * Register the socket listeners here
   */
  public componentDidMount() {
    const { io } = this.props;
    io.on("receivedInitialState", this.handleReceiveInitialState);
    io.on("addRemoteItem", this.handleRemoteListItemAdded);
    io.on("checkedItem", this.handleRemoteListItemStateChange);
    io.on("deleteRemoteItem", this.handleRemoteDeleteItem);
    io.on("reconnect", this.handleReconnect);
    io.on("updateItem", this.handleRemoteUpdateItem);
    io.on("disconnect", this.handleDisconnect);
  }

  /**
   * Unregister the socket listeners here to prevent things being updated twice on remount
   */
  public componentWillUnmount() {
    const { io } = this.props;
    io.off("receivedInitialState", this.handleReceiveInitialState);
    io.off("addRemoteItem", this.handleRemoteListItemAdded);
    io.off("checkedItem", this.handleRemoteListItemStateChange);
    io.off("deleteRemoteItem", this.handleRemoteDeleteItem);
    io.off("reconnect", this.handleReconnect);
    io.off("updateItem", this.handleRemoteUpdateItem);
    io.off("disconnect", this.handleDisconnect);
  }

  /**
   * Handle the reconnect to the socket. Send a fresh request for all the list items.
   * This will trigger a rerender when the new state is sent, updating the view with the data missed while asleep
   */
  public handleReconnect() {
    this.getAllFromServer();
  }
  /**
   * Handle a disconnect from the server. Force a rerender to display this to the user
   */
  public handleDisconnect() {
    console.error("Socket closed unexpectedly");
    this.forceUpdate();
  }

  /**
   * Send a request to the server to fetch all the list items
   */
  private getAllFromServer() {
    this.props.io.emit("getAll");
  }

  /**
   * Handle incoming 'getAllItems' socket event
   */
  public handleReceiveInitialState(items: Item[]) {
    console.log("Received all list items from server : ", items);
    this.props.createAllItems(items);
  }

  /**
   * Handle incoming 'createItem' socket event
   */
  public handleRemoteListItemAdded(item: Item) {
    const { uuid, text, addedBy, position } = item;
    console.log(uuid, text, "was added by", addedBy);
    this.props.createItem({
      uuid,
      position,
      addedBy,
      text,
      checked: false,
      archived: false
    });
  }

  /**
   * Handle an 'updateItem' socket event. Update the item in state
   * @param item The item to update
   */
  public handleRemoteListItemStateChange(item: Item) {
    this.props.updateItem(item);
  }

  /**
   * Handle a 'deleteItem' socket event
   * @param uuid The uuid of the item to delete
   */
  public handleRemoteDeleteItem(uuid: string) {
    console.log(uuid, "deleting id");
    this.props.deleteItem(uuid);
  }

  /**
   * Handle an 'itemUpdate' socket event
   * @param item The item to update
   */
  public handleRemoteUpdateItem(item: Item) {
    console.log("updated: ", item);
    this.props.updateItem(item);
  }

  render() {
    return (
      <React.Fragment>
        <List
          io={this.props.io}
          username={this.props.username}
          userId={this.props.userId}
        />
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    createItem: (item: Item) => dispatch(createItem(item)),
    createAllItems: (items: Item[]) => dispatch(getAllItems(items)),
    updateItem: (item: Item) => dispatch(updateItem(item)),
    deleteItem: (itemUuid: string) => dispatch(deleteItem(itemUuid))
  };
};

const WrappedEventListener = connect(
  undefined,
  mapDispatchToProps
)(EventListener);
export default WrappedEventListener;
