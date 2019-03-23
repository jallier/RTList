import * as React from "react";
import styled from "react-emotion";
import { StyledPaper, BGDiv } from "../styles";
import { CenteredLayout } from "../CenteredLayout";
import { Typography } from "@material-ui/core";

export class Home extends React.Component {
  public render() {
    return (
      <BGDiv>
        <CenteredLayout toppadding={"25px"}>
          <StyledPaper width={"900px"}>
            <Typography variant={"h1"}>RTList</Typography>
            <br />
            <Typography variant={"body2"}>
              Sign in, or sign up to access your lists. Click on the links in
              the navbar above to begin
            </Typography>
          </StyledPaper>
        </CenteredLayout>
      </BGDiv>
    );
  }
}
