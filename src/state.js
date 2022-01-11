import produce from "immer";
import { useCallback, useContext } from "react";
import { createContextState, useCombinedContext } from "./contextState";

const { state, setter, provider } = createContextState({
  nodes: new Map(),
  positions: new Map(),
  selectedNodeIDs: new Set(),
  edges: new Map(),
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

const { positions, ...DataContext } = AppStateContext;

export function useAppStateDataContext() {
  return useCombinedContext(DataContext);
}
