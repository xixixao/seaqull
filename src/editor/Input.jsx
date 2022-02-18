import {
  acceptCompletion,
  autocompletion,
  closeCompletion,
} from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import { commentKeymap } from "@codemirror/comment";
import { classHighlightStyle } from "@codemirror/highlight";
import {
  history,
  redo,
  redoSelection,
  undo,
  undoSelection,
} from "@codemirror/history";
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
import { useAppRedo, useAppUndo } from "./historyHooks";
import { useZoomPanHelper } from "./react-flow";
import { useNode } from "./react-flow/components/Nodes/wrapNode";
import {
  useSetAppStateContext,
  useSetAppStateWithoutRecordingContext,
} from "./state";
import { Box } from "./ui/Box";
import { codeMirrorStyles } from "./ui/codeMirrorStyles";

export default function Input({
  extensions,
  emptyDisplayValue,
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
  const cleanup = useCallback(() => {
    if (editorRef.current?.view != null) {
      closeCompletion(editorRef.current.view);
    }
  }, []);
  const focusParent = useCallback(() => {
    if (editorRef.current?.container != null) {
      editorRef.current.container.closest(".react-flow__node").focus();
    }
  }, []);
  const stopEditing = useCallback(
    (newValue) => {
      setEdited(null);
      if (newValue !== value) {
        onChange(newValue);
      }
      cleanup();
    },
    [cleanup, onChange, value]
  );
  const handleConfirm = useCallback(
    (value) => {
      stopEditing(value);
      focusParent();
    },
    [focusParent, stopEditing]
  );
  const handleGivenValueChanged = useCallback(() => {
    setEdited(null);
    cleanup();
    focusParent();
  }, [cleanup, focusParent]);
  const node = useNode();
  const nodeID = node?.id;
  useEffectUpdateNodeEdited(nodeID, edited);
  useEffectConfirmOnClickOutside(editorRef, edited, handleConfirm);
  const { zoomTo } = useZoomPanHelper();
  const setAppState = useSetAppStateContext();
  const startEditing = useCallback(
    (event) => {
      // Deselects other selected nodes when edit starts
      setAppState((appState) => {
        Nodes.select(appState, [Node.fake(nodeID)]);
      });
      zoomTo(1);
      if (event != null) {
        setClick({ x: event.clientX, y: event.clientY });
      }
      setEdited(value ?? "");
    },
    [value, nodeID, setAppState, zoomTo]
  );
  const undoApp = useAppUndo();
  const redoApp = useAppRedo();
  const setEditorRef = useRefEffectControlEditingViaFocus(editorRef, {
    value,
    edited,
    startEditing,
    stopEditing,
    handleGivenValueChanged,
  });
  const isEmpty = isBlank(emptyDisplayValue ?? value);
  return (
    <div style={{ display: "inline-block" }}>
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
          ref={setEditorRef}
          value={edited}
          editable={true}
          onUndo={undoApp}
          onRedo={redoApp}
          onMouseDown={stopEventPropagation}
          onTouchStart={stopEventPropagation}
          onChange={setEdited}
          // onConfirm={onChange}
          onConfirm={handleConfirm}
          onKeyDown={stopEventPropagation}
          onCopy={stopEventPropagation}
        />
      ) : (
        <CodeEditor
          css={{
            borderWidth: isEmpty ? "0 0 1px 0" : "0",
            cursor: "pointer",
            minWidth: isEmpty ? "100px" : undefined,
          }}
          extensions={extensions}
          ref={setEditorRef}
          editable={false}
          value={!isEmpty && isBlank(value) ? emptyDisplayValue : value}
          onClick={startEditing}
          onKeyDown={stopEventPropagation}
          onCopy={stopEventPropagation}
        />
      )}
    </div>
  );
}

function isBlank(string) {
  return /^\s*$/.test(string);
}

function stopEventPropagation(event) {
  event.stopPropagation();
}

function useRefEffectControlEditingViaFocus(
  editorRef,
  { value, edited, startEditing, stopEditing, handleGivenValueChanged }
) {
  const [givenValue, updateGivenValue] = useState(value);
  useEffect(() => {
    if (value !== givenValue) {
      updateGivenValue(value);
      if (value !== "") {
        handleGivenValueChanged();
      }
    }
  }, [edited, givenValue, handleGivenValueChanged, value]);
  const startEditingOnFocus = useCallback(() => {
    if (edited == null) {
      startEditing();
    }
  }, [edited, startEditing]);
  const stopEditingOnFocusOut = useCallback(
    (event) => {
      // Need to make sure we're not being updated from outside
      // while defocusing
      if (edited != null && value === givenValue) {
        stopEditing(edited);
      }
    },
    [edited, givenValue, stopEditing, value]
  );
  return useCallback(
    (current) => {
      editorRef.current?.container?.removeEventListener(
        "focusin",
        startEditingOnFocus
      );
      current?.container?.addEventListener("focusin", startEditingOnFocus);
      editorRef.current?.container?.removeEventListener(
        "focusout",
        stopEditingOnFocusOut
      );
      current?.container?.addEventListener("focusout", stopEditingOnFocusOut);
      editorRef.current = current;
    },
    [editorRef, startEditingOnFocus, stopEditingOnFocusOut]
  );
}

function useEffectUpdateNodeEdited(nodeID, edited) {
  const setAppState = useSetAppStateWithoutRecordingContext();
  useEffect(() => {
    if (nodeID != null) {
      setAppState((appState) => {
        Nodes.positionOf(appState, Node.fake(nodeID)).edited = edited != null;
      });
    }
  }, [edited, nodeID, setAppState]);
}

function useEffectConfirmOnClickOutside(editorRef, edited, handleConfirm) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        edited != null &&
        !editorRef.current?.container.contains(event.target)
      ) {
        handleConfirm(edited);
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [editorRef, edited, handleConfirm]);
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
    onUndo,
    onRedo,
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
    onUndo,
    onRedo,
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
  const {
    value,
    extensions,
    onChange,
    onConfirm,
    editable,
    click,
    onUndo,
    onRedo,
  } = props;
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
    ...(extensions ?? []),
    EditorState.allowMultipleSelections.of(true),
    history(),
    editable ? drawSelection() : [],
    tooltips({ position: "absolute" }),
    autocomplete.slice(0, -1 /*remove theme*/),
    keymap.of([
      ...defaultKeymap.filter(({ key }) => key !== "Mod-Enter"),
      ...commentKeymap,
      {
        key: "Mod-Enter",
        run: (view) => {
          acceptCompletion(view);
          const doc = view.state.doc;
          const value = doc.toString();
          onConfirm(value);
        },
      },
      {
        key: "Mod-z",
        run: (view) => {
          if (!undo(view)) {
            onUndo();
          }
          return true;
        },
        preventDefault: true,
      },
      {
        key: "Mod-y",
        mac: "Mod-Shift-z",
        run: (view) => {
          if (!redo(view)) {
            console.log("redo from editor");
            onRedo();
          }
          return true;
        },
        preventDefault: true,
      },
      { key: "Mod-u", run: undoSelection, preventDefault: true },
      {
        key: "Alt-u",
        mac: "Mod-Shift-u",
        run: redoSelection,
        preventDefault: true,
      },
    ]),
    updateListener,
    ResetStyles,
    classHighlightStyle,
    // Important! we don't do this to maintain focusability
    // EditorView.editable.of(editable),
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
