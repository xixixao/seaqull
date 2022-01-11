/**
 * The user selection rectangle gets displayed when a user drags the mouse while pressing shift
 */
import React, { memo } from "react";
import { useAppStateContext } from "../../../state";
import { useStoreActions, useStoreState } from "../../store/hooks";
import { useAddSelectedElements } from "../../store/reducer";
import { getNodesInside } from "../../utils/graph";
function getMousePosition(event) {
  const reactFlowNode = event.target.closest(".react-flow");
  if (!reactFlowNode) {
    return;
  }
  const containerBounds = reactFlowNode.getBoundingClientRect();
  return {
    x: event.clientX - containerBounds.left,
    y: event.clientY - containerBounds.top,
  };
}
const SelectionRect = () => {
  const userSelectionRect = useStoreState((state) => state.userSelectionRect);
  if (!userSelectionRect.draw) {
    return null;
  }
  return (
    <div
      className="react-flow__selection"
      style={{
        width: userSelectionRect.width,
        height: userSelectionRect.height,
        transform: `translate(${userSelectionRect.x}px, ${userSelectionRect.y}px)`,
      }}
    />
  );
};
export default memo(({ selectionKeyPressed }) => {
  const selectionActive = useStoreState((state) => state.selectionActive);
  const elementsSelectable = useStoreState((state) => state.elementsSelectable);
  const setUserSelection = useStoreActions(
    (actions) => actions.setUserSelection
  );
  const updateUserSelection = useStoreActions(
    (actions) => actions.updateUserSelection
  );
  const unsetUserSelection = useStoreActions(
    (actions) => actions.unsetUserSelection
  );
  const unsetNodesSelection = useStoreActions(
    (actions) => actions.unsetNodesSelection
  );
  const userSelectionRect = useStoreState((state) => state.userSelectionRect);
  const transform = useStoreState((state) => state.transform);
  const appState = useAppStateContext();
  const addSelectedElements = useAddSelectedElements();

  const renderUserSelectionPane = selectionActive || selectionKeyPressed;
  if (!elementsSelectable || !renderUserSelectionPane) {
    return null;
  }
  const onMouseDown = (event) => {
    const mousePos = getMousePosition(event);
    if (!mousePos) {
      return;
    }
    setUserSelection(mousePos);
  };
  const onMouseMove = (event) => {
    if (!selectionKeyPressed || !selectionActive) {
      return;
    }
    const mousePos = getMousePosition(event);
    if (!mousePos) {
      return;
    }

    const startX = userSelectionRect.startX ?? 0;
    const startY = userSelectionRect.startY ?? 0;
    const nextUserSelectRect = {
      ...userSelectionRect,
      x: mousePos.x < startX ? mousePos.x : userSelectionRect.x,
      y: mousePos.y < startY ? mousePos.y : userSelectionRect.y,
      width: Math.abs(mousePos.x - startX),
      height: Math.abs(mousePos.y - startY),
    };
    const selectedNodes = getNodesInside(
      appState,
      nextUserSelectRect,
      transform,
      false,
      true
    );
    addSelectedElements(selectedNodes);
    updateUserSelection(nextUserSelectRect);
  };
  const onMouseUp = () => {
    unsetUserSelection();
  };
  const onMouseLeave = () => {
    unsetUserSelection();
    unsetNodesSelection();
  };
  return (
    <div
      className="react-flow__selectionpane"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <SelectionRect />
    </div>
  );
});
