import * as Nodes from "graph/Nodes";
import { onlyWarns } from "js/Arrays";
import { useCallback } from "react";
import { createContextState, useCombinedContext } from "../react/contextState";

export const {
  state: AppStateContext,
  useSetState: useSetAppStateContext,
  provider: AppStateContextProvider,
} = createContextState({
  nodes: new Map(),
  positions: new Map(),
  lastSelectedNodeIDs: new Set(),
  selectedNodeIDs: new Set(),
  highlightedNodeIDs: new Set(),
  edges: new Map(),
});

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

export function useAppStateContext() {
  return useCombinedContext(AppStateContext);
}

const { positions, highlightedNodeIDs, ...DataContext } = AppStateContext;

export function useAppStateDataContext() {
  return useCombinedContext(DataContext);
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
        producer(Nodes.current(appState, node));
      });
    },
    [setAppState, node]
  );
}
