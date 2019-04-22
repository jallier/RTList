import * as React from "react";
import { PaddedBody } from "./PaddedBody";
import styled from "react-emotion";
import { AppBar, Tabs, Tab, Button } from "@material-ui/core";
import SwipeableViews from "react-swipeable-views";
import LiveItems from "./LiveItems";
import ArchivedItems from "./ArchivedItems";

interface ListProps {
  io: SocketIOClient.Socket;
  username: string;
  userId: number;
}

interface ListState {
  tabValue: number;
}

const Body = styled("div")`
  background-color: #eeeeee;
`;

export class List extends React.Component<ListProps, ListState> {
  public constructor(props: ListProps) {
    super(props);

    this.state = {
      tabValue: 0
    };
  }
  /**
   * Handle the tab change. This is an arrow function because this is just proof of concept and will be changing soon
   */
  handleTabChange = (event: React.ChangeEvent, value: number) => {
    this.setState({ tabValue: value });
  };

  /**
   * Same deal as the function. Handle change when tabs are swiped
   */
  handleSwipeTabChange = (index: number) => {
    this.setState({ tabValue: index });
  };

  public render() {
    return (
      <PaddedBody>
        <Body>
          <div>
            <AppBar position="relative" color="default">
              <Tabs
                value={this.state.tabValue}
                onChange={this.handleTabChange}
                variant="fullWidth"
              >
                <Tab label="List" />
                <Tab label="Archive" />
              </Tabs>
            </AppBar>
            <SwipeableViews
              index={this.state.tabValue}
              onChangeIndex={this.handleSwipeTabChange}
            >
              <div>
                <LiveItems
                  userId={this.props.userId}
                  username={this.props.username}
                  io={this.props.io}
                />
              </div>
              <div>
                <ArchivedItems
                  userId={this.props.userId}
                  username={this.props.username}
                  io={this.props.io}
                />
              </div>
            </SwipeableViews>
          </div>
        </Body>
      </PaddedBody>
    );
  }
}
