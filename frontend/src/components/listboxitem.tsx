import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import * as React from 'react';
import { DeleteButton } from './deleteButton';
import styled from 'react-emotion';
import { StyledListItemCheckbox, StyledListItem, StyledListItemText } from './styles';
import { ClickAwayListener, TextField } from '@material-ui/core';

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
  textDecoration: 'line-through',
};

const GreySpan = styled('span')`
  color: grey;
`;

export class ListBoxItem extends React.Component<ListBoxItemProps, ListBoxItemState> {
  private textInput: React.RefObject<HTMLInputElement>;
  constructor(props: ListBoxItemProps) {
    super(props);
    this.state = { showDeleteIcon: false, editable: false, currentText: this.props.text };
    this.textInput = React.createRef();
    console.log(this.textInput);

    this.handleSubClick = this.handleSubClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleItemAddedByClick = this.handleItemAddedByClick.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleClickAway = this.handleClickAway.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
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
      console.log('The item should be edited', this.textInput.current);
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

  render() {
    return (
      <StyledListItem>
        <StyledListItemCheckbox checked={!!+this.props.checked} onClick={this.handleSubClick} />
        {!this.state.editable ?
          // Regular mode
          (<StyledListItemText
            strikethrough={!!this.props.checked}
            primary={this.state.currentText}
            onClick={this.handleItemClick}
          />
          ) :
          (
            // Edit Mode
            <ClickAwayListener onClickAway={this.handleClickAway}>
              <TextField label="Pls Edit" onChange={this.handleTextChange} inputRef={this.textInput} />
            </ClickAwayListener>
          )
        }
        <span onClick={this.handleItemAddedByClick}>
          <GreySpan>
            {this.props.addedBy}
          </GreySpan>
          {!this.props.checkedBy ? '' : ':'}
          <GreySpan>
            {this.props.checkedBy}
          </GreySpan>
        </span>
        <DeleteButton onClick={this.handleDeleteClick} show={this.state.showDeleteIcon} />
      </StyledListItem>
    );
  }
}
