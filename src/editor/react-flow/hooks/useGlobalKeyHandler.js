import { useEffect } from "react";
import { useStore, useStoreActions } from "../store/hooks";
import useKeyPress from "./useKeyPress";
import { isNode, getConnectedEdges } from "../utils/graph";
import { useResetSelectedElements } from "../store/reducer";

export default function useGlobalKeyHandler({
  deleteKeyCode,
  multiSelectionKeyCode,
  onElementsRemove,
}) {
  const store = useStore();
  const unsetNodesSelection = useStoreActions(
    (actions) => actions.unsetNodesSelection
  );
  const setMultiSelectionActive = useStoreActions(
    (actions) => actions.setMultiSelectionActive
  );
  const resetSelectedElements = useResetSelectedElements();
  const deleteKeyPressed = useKeyPress(deleteKeyCode);
  const multiSelectionKeyPressed = useKeyPress(multiSelectionKeyCode);
  useEffect(() => {
    const { edges, selectedElements } = store.getState();
    if (onElementsRemove && deleteKeyPressed && selectedElements) {
      const selectedNodes = selectedElements.filter(isNode);
      const connectedEdges = getConnectedEdges(selectedNodes, edges);
      const elementsToRemove = [...selectedElements, ...connectedEdges].reduce(
        (res, item) => res.set(item.id, item),
        new Map()
      );
      onElementsRemove(Array.from(elementsToRemove.values()));
      unsetNodesSelection();
      resetSelectedElements();
    }
  }, [deleteKeyPressed]);
  useEffect(() => {
    setMultiSelectionActive(multiSelectionKeyPressed);
  }, [multiSelectionKeyPressed]);
}
