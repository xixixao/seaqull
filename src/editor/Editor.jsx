import React from "react";

import { ThemeProvider } from "./theme/useTheme";
import App from "./App";
import { ThemeToggle } from "./theme/ThemeToggle";

export function Editor() {
  return (
    <ThemeProvider>
      <ThemeToggle
        css={{ position: "absolute", top: "$20", right: "$20", zIndex: 100 }}
      />
      <App />
    </ThemeProvider>
  );
}
