import * as React from "react";

export class Test extends React.Component {
  render() {
    return (
      <div className="test">
        <header>This is a test page</header>
        <div>
          This is the second page that should dynamically replace the first
          page. Fingers crossed.
        </div>
      </div>
    );
  }
}
