import * as React from "react";
import { groupBy, map as loMap } from "lodash";
import { Item } from "../lib/types";
import * as moment from "moment";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from "@material-ui/core";
import { ListBoxItem, ListBoxItemProps } from "./listboxitem";
import { ExpandMore } from "@material-ui/icons";
import { AppState } from "../store";
import { Dispatch } from "redux";
import { updateItem, deleteItem } from "../store/items/actions";
import { connect } from "react-redux";

interface ArchivedItemsProps {
  io: SocketIOClient.Socket;
  username: string;
  userId: number;
  archivedItems: Item[];
  updateItem: (item: Item) => void;
  deleteItem: (itemUuid: string) => void;
}

export class ArchivedItems extends React.Component<ArchivedItemsProps> {
  public constructor(props: ArchivedItemsProps) {
    super(props);

    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleListItemClick = this.handleListItemClick.bind(this);
    this.handleUpdateItem = this.handleUpdateItem.bind(this);
  }
  /**
   * Handle when an item in the list is clicked. Update the state and emit a socket event
   * @param item The item that was clicked
   */
  public handleListItemClick(item: ListBoxItemProps) {
    const checked = !item.checked; // Reverse this as it represents the current state, not the state it was at the time
    let maxPosition = 0;
    this.props.updateItem({
      uuid: item.id,
      addedBy: item.addedBy,
      archived: item.archived,
      checked,
      checkedBy: this.props.username,
      position: maxPosition,
      text: item.text
    });
    this.props.io.emit(
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
    this.props.io.emit("deleteItem", uuid);
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
    this.props.io.emit("updateItem", item.id, item.text);
  }

  /**
   * Group items into subarrays by date
   *
   * @param items Items to group
   */
  private groupArchivedByDate(items: Item[]) {
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
    const groupedArchivedItems = this.groupArchivedByDate(
      this.props.archivedItems
    );
    return (
      <React.Fragment>
        <h3>Archived</h3>
        {loMap(groupedArchivedItems, (itemArr, key) => {
          return (
            <ExpansionPanel key={key}>
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
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  const { archivedItems } = state.items;
  return {
    archivedItems
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    updateItem: (item: Item) => dispatch(updateItem(item)),
    deleteItem: (itemUuid: string) => dispatch(deleteItem(itemUuid))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArchivedItems);
