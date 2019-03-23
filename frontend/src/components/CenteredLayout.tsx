import * as React from "react";
import styled from "react-emotion";

interface CenteredLayoutProps {
  toppadding?: string;
  children: JSX.Element[] | JSX.Element | string;
}

interface DivProps {
  toppadding?: string;
}

const Div = styled("div")`
  align-items: center;
  display: flex;
  justify-content: center;
  ${(props: DivProps) => `padding-top: ${props.toppadding};` || ""}
`;

export class CenteredLayout extends React.Component<CenteredLayoutProps> {
  public render() {
    return <Div toppadding={this.props.toppadding}>{this.props.children}</Div>;
  }
}
