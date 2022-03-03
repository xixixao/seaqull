import React from "react";
import ReactDOM from "react-dom";

export function render(app) {
  ReactDOM.render(
    <React.StrictMode>{app}</React.StrictMode>,
    document.getElementById("root")
  );
}
