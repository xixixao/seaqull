import { SunIcon } from "@modulz/radix-icons";
import React, { useEffect } from "react";
import { IconButton } from "../ui/interactive/IconButton";
import { darkTheme } from "../ui/styled/style";
import { Tooltip } from "../ui/interactive/Tooltip";
import { useTheme } from "./useTheme";

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle(
      darkTheme.className,
      theme === "dark"
    );
    document.documentElement.style.setProperty("color-scheme", theme);
  }, [theme]);

  return (
    <Tooltip content="Toggle theme">
      <IconButton
        onClick={() => {
          setTheme(theme === "dark" ? "light" : "dark");
        }}
        aria-label="toggle a light and dark color scheme"
      >
        <SunIcon />
      </IconButton>
    </Tooltip>
  );
}
