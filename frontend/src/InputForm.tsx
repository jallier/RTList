import * as React from 'react';

interface InputFormProps {
  // tslint:disable-next-line:no-any
  handleSubmit: any;
  // tslint:disable-next-line:no-any
  handleChange: any;
}

// tslint:disable-next-line:no-any
export class InputForm extends React.Component<InputFormProps> {
  public constructor(props: InputFormProps) {
    super(props);
  }

  public render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <input type="text" onChange={this.props.handleChange} />
      </form>
    );
  }
}