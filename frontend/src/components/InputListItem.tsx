import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Send from "@material-ui/icons/Send";
import IconButton from "@material-ui/core/IconButton";
import { InputAdornment } from "@material-ui/core";

interface InputListItemProps {
  label: string;
  width?: string;
  height?: string;
  handleSubmit: (value: string) => void;
}

interface InputListItemState {
  value: string;
}

export class InputListItem extends React.Component<
  InputListItemProps,
  InputListItemState
> {
  private InputListItemTextFieldStyle: React.CSSProperties = {
    width: this.props.width || "200px",
    height: this.props.height || "60px",
    marginTop: "0"
  };

  public constructor(props: InputListItemProps) {
    super(props);

    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Function to handle setting the state from input changes
   * @param e Event passed from input
   */
  public handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ value: e.currentTarget.value });
  }

  /**
   * Function to handle submitted the data from the form. This will pass the current input item state 
   * back to the parent component using the callback function from the props
   * @param e Event from form
   */
  public handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { value } = this.state;
    this.props.handleSubmit(value);
    e.currentTarget.reset();
  }

  public render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <TextField
          label={this.props.label}
          variant="outlined"
          margin="normal"
          style={this.InputListItemTextFieldStyle}
          onChange={this.handleChange}
          InputProps={{
            // Used to render the send icon on the right of the input
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type={"submit"}>
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
