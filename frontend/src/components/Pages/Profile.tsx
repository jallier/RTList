import * as React from 'react';
import { Input } from '../styles';

// Move this to a separate file
interface ProfileSettingProps {
  title: string;
  description?: string;
}
class ProfileSetting extends React.Component<ProfileSettingProps> {
  public render() {
    return (
      <div>
        <h3>{this.props.title}</h3>
        <p>{this.props.description}</p>
        <Input />
      </div>
    );
  }
}

export class Profile extends React.Component {
  public render() {
    return (
      <div>
        <h1>Settings</h1>
        <ProfileSetting title={'Change username'} />
        <ProfileSetting title={'Change email address'} />
        <h3>Shared Lists</h3>
      </div>
    );
  }
}