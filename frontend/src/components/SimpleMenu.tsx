import * as React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

interface SimpleMenuProps {
  menuItems: { text: string, callback: (e: React.SyntheticEvent<HTMLElement>) => void }[];
}

interface SimpleMenuState {
  anchor: HTMLElement | null;
}

/**
 * Class for a simple menu. Takes an element as a child which becomes the button for the menu.
 */
export class SimpleMenu extends React.Component<SimpleMenuProps, SimpleMenuState> {
  constructor(props: SimpleMenuProps) {
    super(props);
    this.state = { anchor: null };

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Handles the click event on the button. Opens the menu
   * @param e Event that is triggered by click
   */
  handleClick(e: React.SyntheticEvent<HTMLElement>) {
    this.setState({ anchor: e.currentTarget });
  }

  /**
   * Handles the click event off the button. Closes the menu
   * @param e Event that is triggered by click
   */
  handleClose(e: React.SyntheticEvent<HTMLElement>) {
    this.setState({ anchor: null });
  }

  render() {
    return (
      <span>
        <Button onClick={this.handleClick} style={{ minWidth: 0, paddingLeft: '8px', paddingRight: '8px' }}>
          {this.props.children}
        </Button>
        <Menu open={!!this.state.anchor} onClose={this.handleClose} anchorEl={this.state.anchor}>
          {
            this.props.menuItems.map((item, index) => (
              <MenuItem key={index} onClick={(e: React.SyntheticEvent<any>) => { this.handleClose(e); item.callback(e); }}>
                {item.text}
              </MenuItem>
            ))
          }
        </Menu>
      </span>
    );
  }
}
