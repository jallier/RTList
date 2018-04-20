import * as React from 'react';
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';

interface DeleteButtonProps {
  text?: string;
  color?: string;
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined; 
  // This seems to be the type definition for the onClick prop
}

export class DeleteButton extends React.Component<DeleteButtonProps> {
  constructor(props: DeleteButtonProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <IconButton aria-label="delete" className="delete-button" onClick={this.props.onClick} >
          <Icon>delete</Icon>
        </IconButton>
      </div>
    );
  }
}