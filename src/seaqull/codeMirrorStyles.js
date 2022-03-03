export const codeMirrorStyles = {
  // Main theme
  // "&": {
  //   color: ivory,
  //   backgroundColor: background
  // },

  ".cm-content": {
    caretColor: "$hiContrast",
  },

  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "$hiContrast",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {
      backgroundColor: "$slate7",
    },

  // TODO: for search and fine
  // ".cm-panels": {backgroundColor: darkBackground, color: ivory},
  // ".cm-panels.cm-panels-top": {borderBottom: "2px solid black"},
  // ".cm-panels.cm-panels-bottom": {borderTop: "2px solid black"},
  // ".cm-searchMatch": {
  //   backgroundColor: "#72a1ff59",
  //   outline: "1px solid #457dff"
  // },
  // ".cm-searchMatch.cm-searchMatch-selected": {
  //   backgroundColor: "#6199ff2f"
  // },

  ".cm-activeLine": { backgroundColor: "$slate2" },
  ".cm-selectionMatch": { backgroundColor: "$slate4" },

  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    // backgroundColor: "$slate5",
    outline: "1px solid $slate5",
  },

  // ".cm-gutters": {
  //   backgroundColor: background,
  //   color: stone,
  //   border: "none"
  // },

  // ".cm-activeLineGutter": {
  //   backgroundColor: highlightBackground
  // },

  // ".cm-foldPlaceholder": {
  //   backgroundColor: "transparent",
  //   border: "none",
  //   color: "#ddd"
  // },

  // Tooltips
  ".cm-tooltip": {
    border: "none",
    background: "$slate7",
    padding: "$4",
    borderRadius: "$4",
  },
  ".cm-tooltip .cm-tooltip-arrow:before": {
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  // ".cm-tooltip .cm-tooltip-arrow:after": {
  //   borderTopColor: tooltipBackground,
  //   borderBottomColor: tooltipBackground
  // },

  // Autocomplete
  ".cm-editor .cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer",
        padding: "1px 3px",
        lineHeight: 1.2,
      },
    },
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "$slate10",
    color: "$loContrast",
    borderRadius: "2px",
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after":
    {
      content: '"···"',
      opacity: 0.5,
      display: "block",
      textAlign: "center",
    },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "300px",
  },
  ".cm-completionInfo.cm-completionInfo-left": {
    right: "100%",
  },
  ".cm-completionInfo.cm-completionInfo-right": {
    left: "100%",
  },
  // "&light .cm-snippetField": {
  //   backgroundColor: "#00000022",
  // },
  // "&dark .cm-snippetField": {
  //   backgroundColor: "#ffffff22",
  // },
  // ".cm-snippetFieldPosition": {
  //   verticalAlign: "text-top",
  //   width: 0,
  //   height: "1.15em",
  //   margin: "0 -0.7px -.7em",
  //   borderLeft: "1.4px dotted #888",
  // },
  ".cm-completionMatchedText": {
    // textDecoration: "underline",
    fontWeight: "bold",
  },
  // ".cm-completionDetail": {
  //   marginLeft: "0.5em",
  //   fontStyle: "italic",
  // },
  // ".cm-completionIcon": {
  //   fontSize: "90%",
  //   width: ".8em",
  //   display: "inline-block",
  //   textAlign: "center",
  //   paddingRight: ".6em",
  //   opacity: "0.6",
  // },
  // ".cm-completionIcon-function, .cm-completionIcon-method": {
  //   "&:after": { content: "'ƒ'" },
  // },
  // ".cm-completionIcon-class": {
  //   "&:after": { content: "'○'" },
  // },
  // ".cm-completionIcon-interface": {
  //   "&:after": { content: "'◌'" },
  // },
  // ".cm-completionIcon-variable": {
  //   "&:after": { content: "'𝑥'" },
  // },
  // ".cm-completionIcon-constant": {
  //   "&:after": { content: "'𝐶'" },
  // },
  // ".cm-completionIcon-type": {
  //   "&:after": { content: "'𝑡'" },
  // },
  // ".cm-completionIcon-enum": {
  //   "&:after": { content: "'∪'" },
  // },
  // ".cm-completionIcon-property": {
  //   "&:after": { content: "'□'" },
  // },
  // ".cm-completionIcon-keyword": {
  //   "&:after": { content: "'🔑\uFE0E'" }, // Disable emoji rendering
  // },
  // ".cm-completionIcon-namespace": {
  //   "&:after": { content: "'▢'" },
  // },
  // ".cm-completionIcon-text": {
  //   "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" },
  // },

  // Syntax highlighting
  ".cmt-comment": {
    color: "$slate11",
  },
  ".cmt-operator": {
    color: "$blue11",
  },
  ".cmt-keyword": {
    color: "$violet11",
  },
  ".cmt-string, .cmt-string2": {
    color: "$green11",
  },
  ".cmt-number": {
    color: "$amber11",
  },
};
