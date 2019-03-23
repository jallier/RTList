import * as React from "react";
import Snackbar from "@material-ui/core/Snackbar";

export interface SnackbarBaseProps {
  show: boolean;
  message: string;
  onClose: (event: React.SyntheticEvent<any>, reason: string) => void;
  SnackbarBaseContentProps?: Partial<any>;
}

export class SnackbarBase extends React.Component<SnackbarBaseProps> {
  public render() {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={this.props.show}
        autoHideDuration={3000}
        message={<span>{this.props.message}</span>}
        onClose={this.props.onClose}
        ContentProps={this.props.SnackbarBaseContentProps}
      />
    );
  }
}
