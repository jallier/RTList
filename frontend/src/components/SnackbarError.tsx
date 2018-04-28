import * as React from 'react';
import { SnackbarBase, SnackbarBaseProps } from './SnackbarBase';

interface SnackbarErrorProps extends SnackbarBaseProps {

}

export class SnackbarError extends React.Component<SnackbarErrorProps> {

  public render() {
    return (
      <SnackbarBase
        show={this.props.show}
        message={this.props.message}
        onClose={this.props.onClose}
        SnackbarBaseContentProps={{ style: { background: 'red' } }}
      />
    );
  }
}
