import { createStitches } from "@stitches/react";

import {
  gray,
  mauve,
  slate,
  sage,
  olive,
  sand,
  tomato,
  red,
  crimson,
  pink,
  plum,
  purple,
  violet,
  indigo,
  blue,
  sky,
  mint,
  cyan,
  teal,
  green,
  grass,
  lime,
  yellow,
  amber,
  orange,
  brown,
  bronze,
  gold,
  grayA,
  mauveA,
  slateA,
  sageA,
  oliveA,
  sandA,
  tomatoA,
  redA,
  crimsonA,
  pinkA,
  plumA,
  purpleA,
  violetA,
  indigoA,
  blueA,
  skyA,
  mintA,
  cyanA,
  tealA,
  greenA,
  grassA,
  limeA,
  yellowA,
  amberA,
  orangeA,
  brownA,
  bronzeA,
  goldA,
  whiteA,
  blackA,
  grayDark,
  mauveDark,
  slateDark,
  sageDark,
  oliveDark,
  sandDark,
  tomatoDark,
  redDark,
  crimsonDark,
  pinkDark,
  plumDark,
  purpleDark,
  violetDark,
  indigoDark,
  blueDark,
  skyDark,
  mintDark,
  cyanDark,
  tealDark,
  greenDark,
  grassDark,
  limeDark,
  yellowDark,
  amberDark,
  orangeDark,
  brownDark,
  bronzeDark,
  goldDark,
  grayDarkA,
  mauveDarkA,
  slateDarkA,
  sageDarkA,
  oliveDarkA,
  sandDarkA,
  tomatoDarkA,
  redDarkA,
  crimsonDarkA,
  pinkDarkA,
  plumDarkA,
  purpleDarkA,
  violetDarkA,
  indigoDarkA,
  blueDarkA,
  skyDarkA,
  mintDarkA,
  cyanDarkA,
  tealDarkA,
  greenDarkA,
  grassDarkA,
  limeDarkA,
  yellowDarkA,
  amberDarkA,
  orangeDarkA,
  brownDarkA,
  bronzeDarkA,
  goldDarkA,
} from "@radix-ui/colors";

const { styled, css, createTheme, globalCss, keyframes } = createStitches({
  theme: {
    colors: {
      ...gray,
      ...mauve,
      ...slate,
      ...sage,
      ...olive,
      ...sand,
      ...tomato,
      ...red,
      ...crimson,
      ...pink,
      ...plum,
      ...purple,
      ...violet,
      ...indigo,
      ...blue,
      ...sky,
      ...mint,
      ...cyan,
      ...teal,
      ...green,
      ...grass,
      ...lime,
      ...yellow,
      ...amber,
      ...orange,
      ...brown,
      ...bronze,
      ...gold,

      ...grayA,
      ...mauveA,
      ...slateA,
      ...sageA,
      ...oliveA,
      ...sandA,
      ...tomatoA,
      ...redA,
      ...crimsonA,
      ...pinkA,
      ...plumA,
      ...purpleA,
      ...violetA,
      ...indigoA,
      ...blueA,
      ...skyA,
      ...mintA,
      ...cyanA,
      ...tealA,
      ...greenA,
      ...grassA,
      ...limeA,
      ...yellowA,
      ...amberA,
      ...orangeA,
      ...brownA,
      ...bronzeA,
      ...goldA,

      ...whiteA,
      ...blackA,

      // Semantic colors
      hiContrast: "$slate12",
      loContrast: "white",
      canvas: "hsl(0 0% 93%)",
      panel: "white",
      transparentPanel: "hsl(0 0% 0% / 97%)",
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
  utils: {
    font: (name) => ({
      fontSize: name,
      fontWeight: name,
      lineHeight: name,
    }),
    paddingHori: (value) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    paddingVert: (value) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    marginHori: (value) => ({
      marginLeft: value,
      marginRight: value,
    }),
    marginVert: (value) => ({
      marginTop: value,
      marginBottom: value,
    }),
    size: (value) => ({
      width: value,
      height: value,
    }),
    userSelect: (value) => ({
      WebkitUserSelect: value,
      userSelect: value,
    }),
    appearance: (value) => ({
      WebkitAppearance: value,
      appearance: value,
    }),
    backgroundClip: (value) => ({
      WebkitBackgroundClip: value,
      backgroundClip: value,
    }),
  },
});

export { styled, css, keyframes };

export const darkTheme = createTheme("dark-theme", {
  colors: {
    ...grayDark,
    ...mauveDark,
    ...slateDark,
    ...sageDark,
    ...oliveDark,
    ...sandDark,
    ...tomatoDark,
    ...redDark,
    ...crimsonDark,
    ...pinkDark,
    ...plumDark,
    ...purpleDark,
    ...violetDark,
    ...indigoDark,
    ...blueDark,
    ...skyDark,
    ...mintDark,
    ...cyanDark,
    ...tealDark,
    ...greenDark,
    ...grassDark,
    ...limeDark,
    ...yellowDark,
    ...amberDark,
    ...orangeDark,
    ...brownDark,
    ...bronzeDark,
    ...goldDark,

    ...grayDarkA,
    ...mauveDarkA,
    ...slateDarkA,
    ...sageDarkA,
    ...oliveDarkA,
    ...sandDarkA,
    ...tomatoDarkA,
    ...redDarkA,
    ...crimsonDarkA,
    ...pinkDarkA,
    ...plumDarkA,
    ...purpleDarkA,
    ...violetDarkA,
    ...indigoDarkA,
    ...blueDarkA,
    ...skyDarkA,
    ...mintDarkA,
    ...cyanDarkA,
    ...tealDarkA,
    ...greenDarkA,
    ...grassDarkA,
    ...limeDarkA,
    ...yellowDarkA,
    ...amberDarkA,
    ...orangeDarkA,
    ...brownDarkA,
    ...bronzeDarkA,
    ...goldDarkA,

    // Semantic colors
    hiContrast: "$slate12",
    loContrast: "$slate1",
    canvas: "hsl(0 0% 15%)",
    panel: "$slate1",
    transparentPanel: "hsl(0 100% 100% / 97%)",
    shadowLight: "hsl(206 22% 7% / 35%)",
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
  table: {
    borderCollapse: "collapse",
    height: "fit-content",
  },
  th: {
    // borderWidth: "1px",
    // borderStyle: "solid",
    // borderColor: "inherit",
    // borderBottom: "1px solid $slate7",
    position: "sticky",
    top: "0",
    background: "$panel",
    whiteSpace: "nowrap",
    textAlign: "start",
    padding: "$8 $4 0 $4",
    boxShadow: "inset 0 -1px 0 $colors$slate7",
  },
  td: {
    // borderWidth: "1px",
    // borderStyle: "solid",
    // borderColor: "inherit",
    // border: "1px solid $slate7",
    padding: "0 4px",
    whiteSpace: "nowrap",
  },
  "tbody tr": {
    borderBottom: "1px solid $slate3",
  },

  // TODO: Convert to proper components
  ".react-flow": {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  ".react-flow__renderer": { ...absoluteFill, zIndex: 4 },
  ".react-flow__pane": { ...absoluteFill, zIndex: 1 },
  ".react-flow__selectionpane": { ...absoluteFill, zIndex: 5 },
  ".react-flow__selection": {
    position: "absolute",
    top: 0,
    left: 0,
    background: "rgba(0, 89, 220, 0.08)",
    border: "1px dotted rgba(0, 89, 220, 0.8)",
  },

  ".react-flow__edges": {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 2,
  },

  ".react-flow__edge": {
    pointerEvents: "visibleStroke",

    "&.inactive": {
      pointerEvents: "none",
    },
  },

  // ".react-flow__edge-textwrapper": {
  //   pointerEvents: "all",
  // },

  // ".react-flow__edge-text": {
  //   pointerEvents: "none",
  //   userSelect: "none",
  // },

  ".react-flow__nodes": {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    transformOrigin: "0 0",
    zIndex: 3,
  },

  ".react-flow__node": {
    position: "absolute",
    userSelect: "none",
    pointerEvents: "all",
    transformOrigin: "0 0",
    outline: "none",
    cursor: "grab",
  },

  ".react-flow__nodesselection": {
    zIndex: 3,
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    transformOrigin: "left top",
    pointerEvents: "none",

    // ".react-flow__nodesselection-rect": {
    //   position: "absolute",
    //   pointerEvents: "all",
    //   cursor: "grab",
    // },
  },

  ".react-flow__handle": {
    pointerEvents: "none",

    "&.connectable": {
      pointerEvents: "all",
      cursor: "crosshair",
    },

    position: "absolute",
    width: "1px",
    height: "1px",
    // background: "#555",
    // border: "1px solid white",
    // borderRadius: "100%",
  },

  ".react-flow__handle-bottom": {
    top: "auto",
    left: "50%",
    bottom: "-4px",
    transform: "translate(-50%, 0)",
  },

  ".react-flow__handle-top": {
    left: "50%",
    top: "-4px",
    transform: "translate(-50%, 0)",
  },

  ".react-flow__handle-left": {
    top: "50%",
    left: "0px",
    transform: "translate(0, -50%)",
  },

  ".react-flow__handle-right": {
    right: "0px",
    top: "50%",
    transform: "translate(0, -50%)",
  },

  ".react-flow__background": absoluteFill,

  // '.react-flow__minimap': {
  //   position: 'absolute',
  //   zIndex: 5,
  //   bottom: '10px',
  //   right: '10px',
  // },

  // TODO: Convert to proper components
  // ".react-flow__selection": {
  //   background: "rgba(0, 89, 220, 0.08)",
  //   border: "1px dotted rgba(0, 89, 220, 0.8)",
  // },

  // Moved up
  // ".react-flow__edge-text": {
  //   fontSize: "10px",
  // },
  // ".react-flow__edge-textbg": {
  //   fill: "white",
  // },
  // ".react-flow__node": {
  //   cursor: "grab",
  // },

  // '.react-flow__node-input',
  // '.react-flow__node-output'
  // ".react-flow__node-default": {
  //   padding: "10px",
  //   borderRadius: "3px",
  //   width: "150px",
  //   fontSize: "12px",
  //   color: "#222",
  //   textAlign: "center",
  //   borderWidth: "1px",
  //   borderStyle: "solid",

  //   background: "#fff",
  //   borderColor: "#1a192b",

  //   "&.selected": {
  //     boxShadow: "0 0 0 0.5px #1a192b",
  //   },
  //   "&.selected:hover": {
  //     boxShadow: "0 0 0 0.5px #1a192b",
  //   },

  //   ".react-flow__handle": {
  //     background: "#1a192b",
  //   },
  // },

  // '.react-flow__node-input.selectable',
  // '.react-flow__node-output.selectable'
  ".react-flow__node-default.selectable": {
    "&:hover": {
      // TODO: make it more prominent
      boxShadow: "0 1px 4px 1px rgba(0, 0, 0, 0.08)",
    },
  },

  // '.react-flow__node-input': {
  //   background: '#fff',
  //   borderColor: '#0041d0',

  //   '&.selected': {
  //     boxShadow: '0 0 0 0.5px #0041d0',
  //   },
  //   '&.selected:hover': {
  //     boxShadow: '0 0 0 0.5px #0041d0',
  //   },

  //   '.react-flow__handle': {
  //     background: '#0041d0',
  //   },
  // },

  // ".react-flow__node-default": {
  //   background: "#fff",
  //   borderColor: "#1a192b",

  //   "&.selected": {
  //     boxShadow: "0 0 0 0.5px #1a192b",
  //   },
  //   "&.selected:hover": {
  //     boxShadow: "0 0 0 0.5px #1a192b",
  //   },

  //   ".react-flow__handle": {
  //     background: "#1a192b",
  //   },
  // },

  // '.react-flow__node-output': {
  //   background: '#fff',
  //   borderColor: '#ff0072',

  //   '&.selected': {
  //     boxShadow: '0 0 0 0.5px #ff0072',
  //   },
  //   '&.selected:hover': {
  //     boxShadow: '0 0 0 0.5px #ff0072',
  //   },

  //   '.react-flow__handle': {
  //     background: '#ff0072',
  //   },
  // },

  ".react-flow__nodesselection-rect": {
    background: "rgba(0, 89, 220, 0.08)",
    border: "1px dotted rgba(0, 89, 220, 0.8)",
  },

  // Moved up
  // '.react-flow__handle': {
  //   position: 'absolute',
  //   width: '6px',
  //   height: '6px',
  //   background: '#555',
  //   border: '1px solid white',
  //   borderRadius: '100%',

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
