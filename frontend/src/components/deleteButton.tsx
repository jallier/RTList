import * as React from 'react';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import styled from 'react-emotion';

interface StyledIconProps {
  show: boolean;
}

const StyledIconButton = styled(IconButton)`
  display: ${(props: StyledIconProps) => props.show ? 'block' : 'none'};
  margin-left: 5px;
`;

interface DeleteButtonProps {
  text?: string;
  color?: string;
  // This seems to be the type definition for the onClick prop
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
  show: boolean;
}

export class DeleteButton extends React.Component<DeleteButtonProps> {
  constructor(props: DeleteButtonProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <StyledIconButton aria-label="delete" onClick={this.props.onClick} show={this.props.show}>
          <Icon>delete</Icon>
        </StyledIconButton>
      </div>
    );
  }
}
