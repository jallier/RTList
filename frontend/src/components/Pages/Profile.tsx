import * as React from "react";
import { Input } from "../styles";
import { Typography, Button } from "@material-ui/core";

// Move this to a separate file
interface ProfileSettingProps {
  title: string;
  description?: string;
}

interface ProfileProps {
  handleLogout: () => void;
}

class ProfileSetting extends React.Component<ProfileSettingProps> {
  public render() {
    return (
      <div>
        <Typography variant="h5">{this.props.title}</Typography>
        <p>{this.props.description}</p>
        <Input />
      </div>
    );
  }
}

export class Profile extends React.Component<ProfileProps> {
  public constructor(props: ProfileProps) {
    super(props);
  }

  public render() {
    return (
      <div>
        <Typography variant="h2">User Settings</Typography>
        <p>
          <Button
            color="secondary"
            variant="outlined"
            onClick={this.props.handleLogout}
          >
            Logout
          </Button>
        </p>
        <p>This page currently has no function. Watch this space</p>
        <ProfileSetting title={"Change username"} />
        <ProfileSetting title={"Change email address"} />
        <Typography variant="h4">Shared Lists</Typography>
      </div>
    );
  }
}
