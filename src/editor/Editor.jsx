import React from "react";

import { ThemeProvider } from "./theme/useTheme";
import App from "./App";
import { ThemeToggle } from "./theme/ThemeToggle";

export function Editor({ language }) {
  return (
    <ThemeProvider>
      <ThemeToggle
        css={{ position: "absolute", top: "$20", right: "$20", zIndex: 100 }}
      />
      <App language={language} />
    </ThemeProvider>
  );
}
