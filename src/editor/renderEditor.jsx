import React from "react";
import ReactDOM from "react-dom";
import { Editor } from "./Editor";

export default function renderEditor(language) {
  ReactDOM.render(
    <React.StrictMode>
      <Editor language={language} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
