import { defaultKeymap } from "@codemirror/commands";
import {
  EditorSelection,
  EditorState,
  StateEffect,
  Transaction,
} from "@codemirror/state";
import {
  EditorView,
  keymap,
  placeholder as extendPlaceholder,
  ViewUpdate,
} from "@codemirror/view";
import { forwardRef } from "react";
import { useImperativeHandle } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Nodes from "graph/Nodes";
import * as Node from "graph/Node";

import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "./theme/useTheme";
import { useSetAppStateContext } from "./state";
import { acceptCompletion, autocompletion } from "@codemirror/autocomplete";
import { tooltips } from "@codemirror/tooltip";
import { Box } from "./ui/Box";
// import { defaultLightThemeOption } from './theme/light';

export default function Input({
  node,
  extensions,
  displayValue,
  autoFocus,
  label,
  value,
  onChange,
}) {
  const [click, setClick] = useState(null);
  const [edited, setEdited] = useState(
    autoFocus ?? false ? (value === "" ? "" : null) : null
  );

  const editorRef = useRef();
  const handleReset = useCallback(() => {
    if (edited === "") {
      return;
    }
    setEdited(null);
    onChange(edited);
  }, [edited, onChange]);
  const [setShouldStopEditingNext, resetShouldStopEditing] =
    useShouldStopEditingOnMouseMoveOutside(handleReset);
  const handleEdit = useCallback(
    (value) => {
      resetShouldStopEditing();
      setEdited(value);
    },
    [resetShouldStopEditing]
  );
  const handleConfirm = useCallback(
    (value) => {
      if (value !== "") {
        setEdited(null);
      }
      onChange(value);
    },
    [onChange]
  );
  useEffectUpdateNodeEdited(node?.id, edited);
  useEffectConfirmOnClickOutside(editorRef, edited, handleConfirm);
  useSyncGivenValue(value, edited, setEdited);

  return (
    <div
      style={{ display: "inline-block" }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    >
      {label != null ? <Label>{label}</Label> : null}
      {edited != null ? (
        <CodeEditor
          extensions={extensions}
          click={click}
          ref={editorRef}
          value={edited}
          onMouseLeave={setShouldStopEditingNext}
          onChange={handleEdit}
          // onConfirm={onChange}
          onConfirm={handleConfirm}
        />
      ) : (
        <div
          style={{ cursor: "pointer" }}
          onClick={(event) => {
            setClick({ x: event.clientX, y: event.clientY });
            setEdited(value ?? "");
          }}
        >
          {displayValue ?? value}
        </div>
      )}
    </div>
  );
}

function useSyncGivenValue(value, edited, setEdited) {
  const [givenValue, updateGivenValue] = useState(value);

  if (value !== givenValue) {
    if (value !== "" && edited != null) {
      setEdited(null);
    }
    updateGivenValue(value);
  }
}

function useEffectUpdateNodeEdited(nodeID, edited) {
  const setAppState = useSetAppStateContext();
  useEffect(() => {
    if (nodeID != null) {
      setAppState((appState) => {
        Nodes.positionOf(appState, Node.fake(nodeID)).edited = edited;
      });
    }
  }, [edited, nodeID, setAppState]);
}

function useEffectConfirmOnClickOutside(editorRef, edited, handleConfirm) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const editor = editorRef.current;
      if (edited != null && !editor.container.contains(event.target)) {
        handleConfirm(edited);
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [editorRef, edited, handleConfirm]);
}

function useShouldStopEditingOnMouseMoveOutside(handleReset) {
  const [shouldStopEditing, setShouldStopEditing] = useState(false);
  const setShouldStopEditingNext = useCallback(() => {
    setShouldStopEditing(true);
  }, []);
  const resetShouldStopEditing = useCallback(() => {
    setShouldStopEditing(false);
  }, []);
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (shouldStopEditing) {
        setShouldStopEditing(false);
        handleReset();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleReset, shouldStopEditing]);
  return [setShouldStopEditingNext, resetShouldStopEditing];
}

function Label(props) {
  return <span style={{ fontSize: 12 }}>{props.children}</span>;
}

const CodeEditor = forwardRef(function CodeEditor(props, ref) {
  const {
    className,
    value = "",
    selection,
    extensions = [],
    onChange,
    autoFocus,
    theme = "light",
    maxHeight,
    width,
    minWidth,
    maxWidth,
    basicSetup,
    placeholder,
    indentWithTab,
    editable,
    root,
    click,
    onConfirm,
    ...other
  } = props;
  const editor = useRef(null);
  const { state, view, container, setContainer } = useCodeMirror({
    container: editor.current,
    root,
    value,
    autoFocus,
    theme,
    maxHeight,
    width,
    minWidth,
    maxWidth,
    basicSetup,
    placeholder,
    indentWithTab,
    editable,
    selection,
    onChange,
    extensions,
    click,
    onConfirm,
  });
  useImperativeHandle(ref, () => ({ container, state, view }), [
    container,
    state,
    view,
  ]);
  useEffect(() => {
    setContainer(editor.current);
    return () => {
      if (view) {
        view.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check type of value
  if (typeof value !== "string") {
    throw new Error(`value must be typeof string but got ${typeof value}`);
  }

  // const defaultClassNames =
  //   typeof theme === "string" ? `cm-theme-${theme}` : "cm-theme";
  return (
    <Box
      css={{
        borderStyle: "solid",
        borderWidth: "0 0 1px 0",
        borderColor: "$blue9",
      }}
      ref={editor}
      {...other}
    ></Box>
  );
});

export function useCodeMirror(props) {
  const {
    value,
    click,
    selection,
    onChange,
    extensions = [],
    autoFocus,
    height = "",
    minHeight = "",
    maxHeight = "",
    placeholder = "",
    width = "",
    minWidth = "",
    maxWidth = "",
    editable = true,
    indentWithTab = true,
    basicSetup = true,
    onConfirm,
    root,
  } = props;
  const [container, setContainer] = useState(props.container);
  const [view, setView] = useState();
  const [state, setState] = useState();
  const [theme] = useTheme();
  const defaultTheme = EditorView.theme({
    "&": {
      height,
      minHeight,
      maxHeight,
      width,
      minWidth: "100px",
      maxWidth,
      cursor: "text",
    },
    "&.cm-editor.cm-focused": { outline: "none" },
    "& .cm-scroller": { fontFamily: "inherit" },
    "& .cm-content": { padding: 0 },
    "& .cm-line": { padding: 0 },
  });
  const updateListener = EditorView.updateListener.of((view) => {
    if (view.docChanged && typeof onChange === "function") {
      const doc = view.state.doc;
      const value = doc.toString();
      onChange(value, view);
    }
  });
  let getExtensions = [
    ...extensions,
    tooltips({ position: "absolute" }),
    autocompletion(),
    keymap.of([
      {
        key: "Mod-Enter",
        run: (view) => {
          acceptCompletion(view);
          const doc = view.state.doc;
          const value = doc.toString();
          onConfirm(value);
        },
      },
      ...defaultKeymap.filter(({ key }) => key !== "Mod-Enter"),
    ]),
    updateListener,
    defaultTheme,
    theme === "dark" ? oneDark : [],
  ];
  // if (basicSetup) {
  //   getExtensions.unshift(defaultBasicSetup);
  // }

  if (placeholder) {
    getExtensions.unshift(extendPlaceholder(placeholder));
  }

  // switch (theme) {
  //   case 'light':
  //     getExtensions.push(defaultLightThemeOption);
  //     break;
  //   case 'dark':
  //     getExtensions.push(oneDark);
  //     break;
  //   default:
  //     getExtensions.push(theme);
  //     break;
  // }

  getExtensions = getExtensions.concat(extensions);

  useEffect(() => {
    if (container && !state) {
      const stateCurrent = EditorState.create({
        doc: value,
        selection,
        extensions: getExtensions,
      });
      setState(stateCurrent);
      if (!view) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container,
          root,
        });
        setView(viewCurrent);
        focusAndPlaceCursor(viewCurrent, click);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, state]);

  useEffect(() => {
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [view]);

  useEffect(() => {
    if (view) {
      const currentValue = view.state.doc.toString();
      if (value !== currentValue) {
        view.dispatch({
          changes: { from: 0, to: currentValue.length, insert: value || "" },
        });
      }
    }
  }, [value, view]);

  useEffect(() => {
    if (view) {
      view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme,
    extensions,
    placeholder,
    height,
    minHeight,
    maxHeight,
    width,
    minWidth,
    maxWidth,
    editable,
    indentWithTab,
    basicSetup,
  ]);

  useEffect(() => {
    if (autoFocus && view) {
      view.focus();
    }
  }, [autoFocus, view]);

  return { state, setState, view, setView, container, setContainer };
}

function focusAndPlaceCursor(view, click) {
  const at = posAtClick(view, click) ?? 0;
  view.focus();
  view.dispatch({ selection: EditorSelection.cursor(at) });
}

function posAtClick(view, click) {
  if (click == null) {
    return;
  }
  return view.posAtCoords(click);
}
