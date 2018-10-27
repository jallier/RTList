import * as React from 'react';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import styled from 'react-emotion';

const StyledIconButton = styled(IconButton)`
  display: none;
  margin-left: 5px;
`;

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
        <StyledIconButton aria-label="delete"  onClick={this.props.onClick} >
          <Icon>delete</Icon>
        </StyledIconButton>
      </div>
    );
  }
}
