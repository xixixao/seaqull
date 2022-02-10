import * as Nodes from "graph/Nodes";
import { onlyWarns } from "js/Arrays";
import { useContext } from "react";
import { useCallback } from "react";
import { createContextState, useCombinedContext } from "../react/contextState";

export const {
  state: AppStateContext,
  useSetState: useSetAppStateContext,
  provider: AppStateContextProvider,
} = createContextState({
  nodes: new Map(),
  edges: new Map(),
  positions: new Map(),
  selectedNodeIDs: new Set(),
  lastSelectedNodeIDs: new Set(),
  highlightedNodeIDs: new Set(),
  modes: { alt: false },
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

const { modes, ...PersistentContext } = AppStateContext;

export function useAppStateContext() {
  return useCombinedContext(PersistentContext);
}

export function useAppModesContext() {
  return useContext(modes);
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
