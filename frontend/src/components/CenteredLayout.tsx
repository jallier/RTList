import * as React from 'react';
import * as styled from './styled-components';

interface CenteredLayoutProps {
  height?: string;
  children: JSX.Element[] | JSX.Element | string;
}

interface DivProps {
  height?: string;
}

const Div = styled.default.div`
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
