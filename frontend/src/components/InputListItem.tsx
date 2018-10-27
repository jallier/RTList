import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import { InputAdornment } from '@material-ui/core';

interface InputListItemProps {
  label: string;
  width?: string;
  height?: string;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export class InputListItem extends React.Component<InputListItemProps> {
  private InputListItemTextFieldStyle: React.CSSProperties = {
    width: (this.props.width || '200px'),
    height: (this.props.height || '60px'),
  };

  public constructor(props: InputListItemProps) {
    super(props);
  }

  public render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <TextField
          label={this.props.label}
          variant="outlined"
          margin="normal"
          style={this.InputListItemTextFieldStyle}
          onChange={this.props.handleChange}
          InputProps={{ // Used to render the send icon on the right of the input
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type={'submit'}>
                  <Send />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </form>
    );
  }
}
