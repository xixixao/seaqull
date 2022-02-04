import {
  acceptCompletion,
  autocompletion,
  closeCompletion,
} from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import { classHighlightStyle } from "@codemirror/highlight";
import { EditorSelection, EditorState, StateEffect } from "@codemirror/state";
import { tooltips } from "@codemirror/tooltip";
import { drawSelection, EditorView, keymap } from "@codemirror/view";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useNode } from "./react-flow/components/Nodes/wrapNode";
import { useSetAppStateContext } from "./state";
import { Box } from "./ui/Box";
import { codeMirrorStyles } from "./ui/codeMirrorStyles";

export default function Input({
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
      setEdited(null);
      onChange(value);
    },
    [onChange]
  );
  const node = useNode();
  const nodeID = node?.id;
  useEffectUpdateNodeEdited(nodeID, edited);
  useEffectConfirmOnClickOutside(edited, handleConfirm);
  useEffectCloseCompletionOnStopEditing(editorRef, edited);
  useSyncGivenValue(value, edited, setEdited);
  const setAppState = useSetAppStateContext();
  const startEditing = useCallback(
    (event) => {
      // Deselects other selected nodes when edit starts
      setAppState((appState) => {
        Nodes.select(appState, [Node.fake(nodeID)]);
      });
      setClick({ x: event.clientX, y: event.clientY });
      setEdited(value ?? "");
    },
    [value, nodeID, setAppState]
  );
  const isEmpty = (displayValue ?? value) === "";
  return (
    <div style={{ display: "inline-block" }} onKeyDown={stopEventPropagation}>
      {label != null ? <Label>{label}</Label> : null}
      {edited != null ? (
        <CodeEditor
          css={{
            borderWidth: "0 0 1px 0",
            minWidth: "100px",
            cursor: "text",
          }}
          extensions={extensions}
          click={click}
          ref={editorRef}
          value={edited}
          editable={true}
          onMouseDown={stopEventPropagation}
          onTouchStart={stopEventPropagation}
          onMouseLeave={setShouldStopEditingNext}
          onChange={handleEdit}
          // onConfirm={onChange}
          onConfirm={handleConfirm}
        />
      ) : (
        <CodeEditor
          css={{
            borderWidth: isEmpty ? "0 0 1px 0" : "0",
            cursor: "pointer",
            minWidth: isEmpty ? "100px" : undefined,
          }}
          extensions={extensions}
          ref={editorRef}
          editable={false}
          value={displayValue ?? value}
          onClick={startEditing}
        />
      )}
    </div>
  );
}

function stopEventPropagation(event) {
  event.stopPropagation();
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

function useEffectConfirmOnClickOutside(edited, handleConfirm) {
  const { nodeElement } = useNode();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (edited != null && !nodeElement.current.contains(event.target)) {
        handleConfirm(edited);
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [nodeElement, edited, handleConfirm]);
}

function useShouldStopEditingOnMouseMoveOutside(handleReset) {
  const [shouldStopEditing, setShouldStopEditing] = useState(false);
  const setShouldStopEditingNext = useCallback(() => {
    setShouldStopEditing(true);
  }, []);
  const resetShouldStopEditing = useCallback(() => {
    setShouldStopEditing(false);
  }, []);
  const { nodeElement } = useNode();
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (shouldStopEditing && !nodeElement.current.contains(event.target)) {
        setShouldStopEditing(false);
        handleReset();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleReset, shouldStopEditing, nodeElement]);
  return [setShouldStopEditingNext, resetShouldStopEditing];
}

function useEffectCloseCompletionOnStopEditing(editorRef, edited) {
  useEffect(() => {
    if (edited == null && editorRef.current?.view != null) {
      closeCompletion(editorRef.current.view);
    }
  }, [edited, editorRef]);
}

function Label(props) {
  return <span style={{ fontSize: 12 }}>{props.children}</span>;
}

const CodeEditor = forwardRef(function CodeEditor(props, ref) {
  const {
    css,
    value,
    extensions,
    onChange,
    onConfirm,
    editable,
    click,
    ...other
  } = props;
  const editor = useRef(null);
  const { state, view, container, setContainer } = useCodeMirror({
    container: editor.current,
    value,
    extensions,
    onChange,
    onConfirm,
    editable,
    click,
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
        borderWidth: 0,
        ...css,
        borderStyle: "solid",
        borderColor: "$blue9",
        ...codeMirrorStyles,
      }}
      ref={editor}
      {...other}
    ></Box>
  );
});

export function useCodeMirror(props) {
  const { value, extensions, onChange, onConfirm, editable, click } = props;
  const [container, setContainer] = useState(props.container);
  const [view, setView] = useState();
  const [state, setState] = useState();
  // Prevent the updateListener from firing after the Editor turned uneditable
  const currentlyEditable = useRef();
  currentlyEditable.current = editable;
  const updateListener = EditorView.updateListener.of((view) => {
    if (
      view.docChanged &&
      typeof onChange === "function" &&
      currentlyEditable.current
    ) {
      const doc = view.state.doc;
      const value = doc.toString();
      onChange(value, view);
    }
  });
  const autocomplete = autocompletion();
  let getExtensions = [
    ...extensions,
    EditorState.allowMultipleSelections.of(true),
    editable ? drawSelection() : [],
    tooltips({ position: "absolute" }),
    autocomplete.slice(0, -1 /*remove theme*/),
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
    ResetStyles,
    classHighlightStyle,
    EditorView.editable.of(editable),
  ];

  useEffect(() => {
    if (container && !state) {
      const stateCurrent = EditorState.create({
        doc: value,
        extensions: getExtensions,
      });
      setState(stateCurrent);
      if (!view) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container,
        });
        setView(viewCurrent);
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
  }, [extensions, editable]);

  useEffect(() => {
    if (editable && view != null) {
      focusAndPlaceCursor(view, click);
    }
  }, [editable, view, click]);

  return { state, setState, view, setView, container, setContainer };
}

function focusAndPlaceCursor(view, click) {
  const at = posAtClick(view, click) ?? 0;
  view.focus();
  view.dispatch({ selection: EditorSelection.cursor(at) });
}

function posAtClick(view, click) {
  if (click == null) {
    return null;
  }
  return view.posAtCoords(click);
}

const ResetStyles = EditorView.theme({
  "&.cm-editor.cm-focused": { outline: "none" },
  "& .cm-scroller": {
    fontFamily: "inherit",
    // This fixes cursors no being visible on edge of editor, but might
    // cause problem if we ever want to scroll horizontally
    overflowX: "visible",
  },
  "& .cm-content": { padding: "0" },
  "& .cm-line": { padding: 0 },
});
