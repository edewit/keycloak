import * as React from "react";
import { Alert } from "@patternfly/react-core";

export class Spinner extends React.Component<{ error: string }> {
  render(): React.ReactNode {
    return (
      <div>
        {!this.props.error && (
          <svg style={{ margin: "auto", background: "rgb(255, 255, 255)", display: "block", shapeRendering: "auto" }} width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#5DBCD2" stroke="none" transform="rotate(16.3145 50 51)">
              <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform>
            </path>
          </svg>
        )}
        {this.props.error && (
          <Alert
            id="spinner alert"
            title="Error"
            variant="danger"
            aria-label="error"
          >
            {this.props.error}
          </Alert>
        )}
      </div>
    );
  }
}