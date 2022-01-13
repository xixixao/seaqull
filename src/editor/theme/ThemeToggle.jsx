import { SunIcon } from "@modulz/radix-icons";
import React, { useEffect } from "react";
import { IconButton } from "../ui/IconButton";
import { darkTheme } from "../style";
import { Tooltip } from "../ui/Tooltip";
import { useTheme } from "./useTheme";

export function ThemeToggle(props) {
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle(
      darkTheme.className,
      theme === "dark"
    );
    document.documentElement.style.setProperty("color-scheme", theme);
  }, [theme]);

  return (
    <Tooltip content="Toggle theme" side="bottom" align="end">
      <IconButton
        onClick={() => {
          setTheme(theme === "dark" ? "light" : "dark");
        }}
        {...props}
        aria-label="toggle a light and dark color scheme"
      >
        <SunIcon />
      </IconButton>
    </Tooltip>
  );
}
