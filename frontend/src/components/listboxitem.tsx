import * as React from "react";
import { DeleteButton } from "./deleteButton";
import styled from "react-emotion";
import {
  StyledListItemCheckbox,
  StyledListItem,
  StyledListItemText
} from "./styles";
import {
  ClickAwayListener,
  TextField,
  InputAdornment,
  IconButton
} from "@material-ui/core";
import { Check } from "@material-ui/icons";

export interface ListBoxItemProps {
  id: string;
  addedBy: string;
  text: string;
  checked: boolean;
  checkedBy?: string;
  checkedById?: number;
  archived: boolean;
  position: number;
  checkedClickHandler: (props: ListBoxItemProps) => void;
  deletedClickHandler: (id: string) => void;
  updatedHandler: (props: ListBoxItemProps) => void;
}

interface ListBoxItemState {
  showDeleteIcon: boolean;
  editable: boolean;
  currentText: string;
}

const ListItemTextStyle = {
  textDecoration: "line-through"
};

const GreySpan = styled("span")`
  color: grey;
`;

export class ListBoxItem extends React.Component<
  ListBoxItemProps,
  ListBoxItemState
> {
  private textInput: React.RefObject<HTMLInputElement>;
  constructor(props: ListBoxItemProps) {
    super(props);
    this.state = {
      showDeleteIcon: false,
      editable: false,
      currentText: this.props.text
    };
    this.textInput = React.createRef();

    this.handleSubClick = this.handleSubClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleItemAddedByClick = this.handleItemAddedByClick.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleClickAway = this.handleClickAway.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleEnterPress = this.handleEnterPress.bind(this);
  }

  /**
   * Function to handle when an item is deleted. This should be passed in through the props so the parent component can handle the global state change
   *
   * @param e Event
   */
  private handleSubClick() {
    this.props.checkedClickHandler(this.props);
  }

  /**
   * Function to handle when an item is deleted. This should be passed in through the props so the parent component can handle the global state change
   *
   * @param e Event
   */
  private handleDeleteClick(e: React.SyntheticEvent<any>) {
    this.props.deletedClickHandler(this.props.id);
  }

  /**
   * Function to handle when the added by text is clicked, in order to show the delete icon
   *
   * @param e Event passed by the click handler
   */
  private handleItemAddedByClick(e: React.SyntheticEvent<any>) {
    this.setState({ showDeleteIcon: !this.state.showDeleteIcon });
  }

  /**
   * Function to handle when the item text is clicked, in order to edit it
   *
   * @param e Event passed by the click handler
   */
  private handleItemClick(e: React.SyntheticEvent<any>) {
    // Disallow editing if item is archived
    if (!this.props.archived) {
      console.log("The item should be edited", this.textInput.current);
      this.textInput.current && this.textInput.current.focus();
      this.setState({ editable: true });
    }
  }

  /**
   * Function to handle when the item is finished being edited. Merge the props with the state, then fire the callback so the parent can take care of the global state
   *
   * @param e Event passed by the click handler
   */
  private handleClickAway(e: React.SyntheticEvent<any>) {
    let mergedProps = { ...this.props, text: this.state.currentText };
    this.props.updatedHandler(mergedProps);
    this.setState({ editable: false });
  }

  /**
   * Function to handle updating the state when a user types in the editable input field for an item
   *
   * @param e Event that is passed in
   */
  private handleTextChange(e: React.SyntheticEvent<any>) {
    this.setState({ currentText: e.currentTarget.value });
  }

  /**
   * Function to handle when enter is pressed while editing an item
   *
   * @param e Event passed in
   */
  private handleEnterPress(e: any) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleClickAway(e);
    }
  }

  render() {
    return (
      <StyledListItem>
        <StyledListItemCheckbox
          checked={!!+this.props.checked}
          onClick={this.handleSubClick}
        />
        {!this.state.editable ? (
          // Regular mode
          <StyledListItemText
            strikethrough={!!this.props.checked}
            primary={this.state.currentText}
            onClick={this.handleItemClick}
          />
        ) : (
          // Edit Mode
          <ClickAwayListener onClickAway={this.handleClickAway}>
            <TextField
              label="Edit this item"
              onChange={this.handleTextChange}
              inputRef={this.textInput}
              style={{ width: "100%" }}
              onKeyDown={this.handleEnterPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" onClick={this.handleClickAway}>
                      <Check />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </ClickAwayListener>
        )}
        <span onClick={this.handleItemAddedByClick}>
          <GreySpan>{this.props.addedBy}</GreySpan>
          {!this.props.checkedBy ? "" : ":"}
          <GreySpan>{this.props.checkedBy}</GreySpan>
        </span>
        <DeleteButton
          onClick={this.handleDeleteClick}
          show={this.state.showDeleteIcon}
        />
      </StyledListItem>
    );
  }
}
