import * as React from 'react';
import * as styled from './styled-components';

interface PaddedBodyProps {
  backgroundColor?: string;
}

export class PaddedBody extends React.Component<PaddedBodyProps> {
  private style: React.CSSProperties = {
    padding: '5px',
    backgroundColor: this.props.backgroundColor || ''
  };
  public render() {
    return (
      <div style={this.style}>
        {this.props.children}
      </div>
    );
  }
}
