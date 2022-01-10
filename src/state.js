import produce from "immer";
import { useCallback } from "react";
import { createContextState, useCombinedContext } from "./contextState";

const { state, useCombinedSetter, provider } = createContextState({
  nodes: new Map(),
  positions: new Map(),
  selectedNodeIDs: new Set(),
  edges: new Map(),
});

export const AppStateContextProvider = provider;

export const AppStateContext = state;

export function useSetAppStateContext() {
  const setState = useCombinedSetter();
  return useCallback(
    (updater) => {
      setState((value) => produce(value, updater));
    },
    [setState]
  );
}

export function useAppStateContext() {
  return useCombinedContext(AppStateContext);
}

export function useAppStateDataContext() {
  const { positions, ...DataContext } = AppStateContext;
  return useCombinedContext(DataContext);
}
