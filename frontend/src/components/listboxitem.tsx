import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import * as React from 'react';
import { DeleteButton } from './deleteButton';
import styled from 'react-emotion';
import { StyledListItemCheckbox, StyledListItem, StyledListItemText } from './styles';

export interface ListBoxItemProps {
  id: string;
  addedBy: string;
  text: string;
  checked: boolean;
  checkedBy?: string;
  checkedById?: number;
  archived: boolean;
  position: number;
  checkedClickHandler: Function;
  deletedClickHandler: Function;
}

interface ListBoxItemState {
  showDeleteIcon: boolean;
}

const ListItemTextStyle = {
  textDecoration: 'line-through',
};

const GreySpan = styled('span')`
  color: grey;
`;

export class ListBoxItem extends React.Component<ListBoxItemProps, ListBoxItemState> {
  constructor(props: ListBoxItemProps) {
    super(props);
    this.state = { showDeleteIcon: false };

    this.handleSubClick = this.handleSubClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleItemAddedByClick = this.handleItemAddedByClick.bind(this);
  }

  // pass this through a method so that the arguments can be passed back up to the parent
  private handleSubClick() {
    this.props.checkedClickHandler(this.props);
  }

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
    console.log('The item text should be edited');
  }

  render() {
    return (
      <StyledListItem>
        <StyledListItemCheckbox checked={!!+this.props.checked} onClick={this.handleSubClick} />
        <StyledListItemText
          strikethrough={!!this.props.checked}
          primary={this.props.text}
          onClick={this.handleItemClick}
        />
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
