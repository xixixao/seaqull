import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "./theme/useTheme";
import App from "./App";
import { ThemeToggle } from "./theme/ThemeToggle";
import "./style";

function Wrapper() {
  return (
    <ThemeProvider>
      <ThemeToggle
        css={{ position: "absolute", top: "$20", right: "$20", zIndex: 100 }}
      />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Wrapper />
  </React.StrictMode>,
  document.getElementById("root")
);
