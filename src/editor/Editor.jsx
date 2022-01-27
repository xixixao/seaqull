import React from "react";

import { ThemeProvider } from "./theme/useTheme";
import App from "./App";
import { ThemeToggle } from "./theme/ThemeToggle";
import { Row } from "./ui/Row";

export function Editor(props) {
  return (
    <ThemeProvider>
      <Row
        align="center"
        css={{ position: "absolute", top: "$20", right: "$20", zIndex: 100 }}
      >
        {props.topRightUI}
        <ThemeToggle />
      </Row>
      <App {...props} />
    </ThemeProvider>
  );
}
