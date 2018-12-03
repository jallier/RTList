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

const Span = styled('span')`
  color: grey;
`;

export class ListBoxItem extends React.Component<ListBoxItemProps, ListBoxItemState> {
  constructor(props: ListBoxItemProps) {
    super(props);
    this.state = { showDeleteIcon: false };

    this.handleSubClick = this.handleSubClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  // pass this through a method so that the arguments can be passed back up to the parent
  private handleSubClick() {
    this.props.checkedClickHandler(this.props);
  }

  private handleDeleteClick(e: React.SyntheticEvent<any>) {
    this.props.deletedClickHandler(this.props.id);
  }

  /**
   * Function to handle when the item itself is clicked, in order to show the delete icon
   * 
   * @param e Event passed by the click handler
   */
  private handleItemClick(e: React.SyntheticEvent<any>) {
    this.setState({ showDeleteIcon: !this.state.showDeleteIcon });
  }

  render() {
    return (
      <StyledListItem onClick={this.handleItemClick}>
        <StyledListItemCheckbox checked={!!+this.props.checked} onClick={this.handleSubClick} />
        <StyledListItemText
          strikethrough={!!this.props.checked}
          primary={this.props.text}
        />
        <Span>
          {this.props.addedBy}
        </Span>
        {!this.props.checkedBy ? '' : ':'}
        <Span>
          {this.props.checkedBy}
        </Span>
        <DeleteButton onClick={this.handleDeleteClick} show={this.state.showDeleteIcon} />
      </StyledListItem>
    );
  }
}
