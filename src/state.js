import produce from "immer";
import { useCallback, useContext } from "react";
import { createContextState } from "./contextState";

const { state, useCombinedSetter, provider } = createContextState({
  nodes: new Map(),
  positions: new Map(),
  selectedNodeIDs: new Set(),
  edges: new Map(),
});

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
export const AppStateContextProvider = provider;

export function useAppStateContext() {
  const nodes = useContext(AppStateContext.nodes);
  const positions = useContext(AppStateContext.positions);
  const selectedNodeIDs = useContext(AppStateContext.selectedNodeIDs);
  const edges = useContext(AppStateContext.edges);
  return { nodes, positions, selectedNodeIDs, edges };
}
