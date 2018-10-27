import * as React from 'react';
import styled from 'react-emotion';

interface CenteredLayoutProps {
  height?: string;
  children: JSX.Element[] | JSX.Element | string;
}

interface DivProps {
  height?: string;
}

const Div = styled('div')`
  align-items: center;
  display: flex;
  justify-content: center;
  ${(props: DivProps) => 'height: ' + props.height + ';' || ''} 
`;

export class CenteredLayout extends React.Component<CenteredLayoutProps> {
  public render() {
    return (
      <Div height={this.props.height}>
        {this.props.children}
      </Div>
    );
  }
}
