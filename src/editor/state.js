import { produce } from "js/immer";
import { onlyWarns } from "js/Arrays";
import { useCallback, useContext } from "react";
import { createContextState, useCombinedContext } from "../react/contextState";
import * as Nodes from "graph/Nodes";

const { state, setter, provider } = createContextState({
  nodes: new Map(),
  positions: new Map(),
  selectedNodeIDs: new Set(),
  highlightedNodeIDs: new Set(),
  edges: new Map(),
  editorConfig: null,
});

export const AppStateContextProvider = provider;

export const AppStateContext = state;

export function useSetAppStateContext() {
  const setState = useContext(setter);
  return useCallback(
    (updater) => {
      setState((value) => produce(value, updater));
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
