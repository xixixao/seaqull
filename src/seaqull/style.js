import { createStitches } from "@stitches/react";
import { darkColors, lightColors } from "./styleColors";
import { styleUtils } from "./styleUtils";

const { styled, css, createTheme, globalCss, keyframes } = createStitches({
  theme: {
    colors: {
      ...lightColors,
      // Semantic colors
      hiContrast: "$slate12",
      loContrast: "white",
      canvas: "hsl(0 0% 93%)",
      panel: "white",
      transparentPanel: "hsl(0 0% 0% / 97%)",
      subtleShadow: "rgb(126, 134, 140, 0.08)",
      shadowLight: "hsl(206 22% 7% / 35%)",
      shadowDark: "hsl(206 22% 7% / 20%)",
    },
    fonts: {
      os: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      mono: "Menlo, Consolas, Monaco, monospace",
    },
    fontSizes: {
      hero: "56px",
      h1: "32px",
      h2: "22px",
      h3: "17px",
      body: "14px",
      detail: "13px",
    },
    lineHeights: {
      hero: "60px",
      h1: "38px",
      h2: "28px",
      h3: "21px",
      body: "22px",
      detail: "13px",
    },
    fontWeights: {
      hero: 700,
      h1: 700,
      h2: 700,
      h3: 700,
      body: 400,
      detail: 400,
    },
    radii: {
      4: "4px",
      6: "6px",
      8: "8px",
      12: "12px",
      round: "50%",
      pill: "9999px",
    },
    space: {
      4: "4px",
      8: "8px",
      12: "12px",
      16: "16px",
      20: "20px",
      24: "24px",
      32: "32px",
      48: "48px",
      64: "64px",
      80: "80px",
    },
    sizes: {
      4: "4px",
      8: "8px",
      12: "12px",
      16: "16px",
      20: "20px",
      24: "24px",
      28: "28px",
      32: "32px",
      36: "36px",
      48: "48px",
      64: "64px",
      80: "80px",
    },
    zIndices: {
      background: 1,
      nodeEditor: 3,
      uiAboveNodes: 5,
      selectedNodes: 10,
      aboveSelectedNodes: 11,
    },
  },
  media: {
    bp1: "(min-width: 520px)",
    bp2: "(min-width: 900px)",
    bp3: "(min-width: 1200px)",
    bp4: "(min-width: 1800px)",
    motion: "(prefers-reduced-motion)",
    hover: "(any-hover: hover)",
    dark: "(prefers-color-scheme: dark)",
    light: "(prefers-color-scheme: light)",
  },
  utils: styleUtils,
});

export { styled, css, keyframes };

export const darkTheme = createTheme("dark-theme", {
  colors: {
    ...darkColors,
    // Semantic colors
    hiContrast: "$slate12",
    loContrast: "$slate1",
    canvas: "hsl(0 0% 15%)",
    panel: "$slate1",
    transparentPanel: "hsl(0 100% 100% / 97%)",
    shadowLight: "hsl(206 22% 7% / 35%)",
    subtleShadow: "rgb(120, 127, 133, 0.08)",
    shadowDark: "hsl(206 22% 7% / 20%)",
  },
});

const absoluteFill = {
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 0,
};

globalCss({
  // Reset CSS: https://www.joshwcomeau.com/css/custom-css-reset/
  "*, *::before, *::after": {
    boxSizing: "border-box",
  },
  "*": {
    margin: 0,
  },
  "html, body, #root": {
    height: "100%",
  },
  "input, button, textarea, select": {
    font: "inherit",
  },
  "p, h1, h2, h3, h4, h5, h6": {
    overflowWrap: "break-word",
  },
  body: {
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
    fontFamily: "$os",
    font: "$body",
    background: "$panel !important",
  },

  ".react-flow__background": absoluteFill,

  // '.react-flow__minimap': {
  //   position: 'absolute',
  //   zIndex: 5,
  //   bottom: '10px',
  //   right: '10px',
  // },

  //   '&.connectable': {
  //     cursor: 'crosshair',
  //   },
  // },

  // '.react-flow__minimap': {
  //   backgroundColor: '#fff',
  // },

  ".react-flow__controls": {
    boxShadow: "0 0 2px 1px rgba(0, 0, 0, 0.08)",
  },

  ".react-flow__controls-button": {
    background: "#fefefe",
    borderBottom: "1px solid #eee",
    boxSizing: "content-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "16px",
    height: "16px",
    cursor: "pointer",
    userSelect: "none",
    padding: "5px",
  },

  ".react-flow__controls-button svg": {
    maxWidth: "12px",
    maxHeight: "12px",
  },

  ".react-flow__controls-button:hover": {
    background: "#f4f4f4",
  },
})();
