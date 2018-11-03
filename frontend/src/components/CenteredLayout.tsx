import * as React from 'react';
import styled from 'react-emotion';

interface CenteredLayoutProps {
  topmargin?: string;
  children: JSX.Element[] | JSX.Element | string;
}

interface DivProps {
  topmargin?: string;
}

const Div = styled('div')`
  align-items: center;
  display: flex;
  justify-content: center;
  ${(props: DivProps) => 'margin-top: ' + props.topmargin + ';' || ''} 
`;

export class CenteredLayout extends React.Component<CenteredLayoutProps> {
  public render() {
    return (
      <Div topmargin={this.props.topmargin}>
        {this.props.children}
      </Div>
    );
  }
}
