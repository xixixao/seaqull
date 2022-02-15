import * as Nodes from "graph/Nodes";
import { onlyWarns } from "js/Arrays";
import { useContext } from "react";
import { useCallback } from "react";
import { createContextState, useCombinedContext } from "../react/contextState";
import {
  historyStack,
  produceAndRecord,
  produceWithoutRecording,
} from "./History";
import * as History from "editor/History";

export const {
  state: AppStateContext,
  useSetState,
  provider: AppStateContextProvider,
} = createContextState({
  nodes: new Map(),
  edges: new Map(),
  positions: new Map(),
  selectedNodeIDs: new Set(),
  lastSelectedNodeIDs: new Set(),
  highlightedNodeIDs: new Set(),
  modes: { alt: false },
  history: { content: historyStack() },
});

// function selectPatchesForRecording(forwardPatches, reversePatches, select) {
//   const contentChange = [
//     forwardPatches.filter(isContentPatch),
//     reversePatches.filter(isContentPatch),
//   ];
//   if (contentChange[0].length > 0) {
//     select("content", [forwardPatches, reversePatches]);
//   }
// }

// const isContentPatch = ({ path }) => {
//   const field = path[0];
//   return field === "nodes" || field === "edges";
// };

export function useSetAppStateWithoutRecordingContext() {
  const setState = useSetState();
  return useCallback(
    (updater) => {
      setState((value) => produceWithoutRecording(value, updater));
    },
    [setState]
  );
}

export function useSetAppStateContext() {
  const setState = useSetState();
  return useCallback(
    (updater) => {
      setState((value) => produceAndRecord(value, updater));
    },
    [setState]
  );
}

export function useSetAppStateCallback(callbackToUpdater) {
  const setAppState = useSetAppStateContext();
  return useCallback(
    (...args) => {
      const updater = callbackToUpdater(...args);
      setAppState(updater);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setAppState]
  );
}

const { modes, history, ...PersistentContext } = AppStateContext;
const { positions, highlightedNodeIDs, ...GraphAndSelectionContext } =
  PersistentContext;
const { lastSelectedNodeIDs, selectedNodeIDs, ...GraphContext } =
  GraphAndSelectionContext;

export function useAppStateContext() {
  return useCombinedContext(PersistentContext);
}

export function useAppModesContext() {
  return useContext(modes);
}

export function useAppGraphContext() {
  return useCombinedContext(GraphContext);
}

export function useAppGraphAndSelectionContext() {
  return useCombinedContext(GraphAndSelectionContext);
}

export function useSetSelectedNodeState() {
  return useSetAppStateCallback((producer) => (appState) => {
    const selected = onlyWarns(Nodes.selected(appState));
    if (selected != null) {
      producer(selected);
    }
  });
}

export function useSetNodeState(node) {
  const setAppState = useSetAppStateContext();
  return useCallback(
    (producer) => {
      setAppState((appState) => {
        History.startRecording(appState);
        producer(Nodes.current(appState, node));
        History.endRecording(appState);
      });
    },
    [setAppState, node]
  );
}
