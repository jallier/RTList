import { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import * as React from 'react';
import { DeleteButton } from './deleteButton';
import * as styled from '../components/styled-components';

export interface ListBoxItemProps {
  id: string;
  username: string;
  text: string;
  checked: boolean;
  checkedClickHandler: Function;
  deletedClickHandler: Function;
}

const ListItemStyle = {
  height: '50px',
  borderBottom: '1px solid grey',
  borderTop: '1px solid grey',
};

const ListItemTextStyle = {
  textDecoration: 'line-through',
};

const Span = styled.default.span`
  color: grey;
`;

export class ListBoxItem extends React.Component<ListBoxItemProps> {
  constructor(props: ListBoxItemProps) {
    super(props);
    this.handleSubClick = this.handleSubClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }

  render() {
    return (
      <ListItem style={ListItemStyle} className="list-box-item">
        <Checkbox checked={!!+this.props.checked} onClick={this.handleSubClick} />
        <ListItemText primary={this.props.text} style={this.props.checked ? ListItemTextStyle : {}} />
        <Span>{this.props.username}</Span>
        <DeleteButton onClick={this.handleDeleteClick} />
      </ListItem>
    );
  }
  // pass this through a method so that the arguments can be passed back up to the parent
  private handleSubClick() {
    this.props.checkedClickHandler(this.props);
  }

  private handleDeleteClick(e: React.SyntheticEvent<any>) {
    this.props.deletedClickHandler(this.props.id);
  }
}