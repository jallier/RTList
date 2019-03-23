import * as React from "react";
import { Redirect, Route, RouteProps } from "react-router";

export interface ProtectedRouteProps extends RouteProps {
  isAuthenticated: boolean;
  redirectToPath: string;
}

export class ProtectedRoute extends Route<ProtectedRouteProps> {
  public render() {
    let redirectPath = "";
    if (!this.props.isAuthenticated) {
      redirectPath = this.props.redirectToPath;
    }

    if (redirectPath) {
      const renderComponent = () => (
        <Redirect to={{ pathname: redirectPath }} />
      );
      return (
        <Route {...this.props} component={renderComponent} render={undefined} />
      );
    } else {
      return <Route {...this.props} />;
    }
  }
}
