/**
 * The user selection rectangle gets displayed when a user drags the mouse while pressing shift
 */
import { Box } from "seaqull/ui/Box";
import { FillParent } from "seaqull/ui/FillParent";
import React, { memo, useState } from "react";
import { useNodesPositionsContext } from "../../state";
import { useStoreState } from "../store/hooks";
import { useAddSelectedElements } from "../store/reducer";
import { getNodesInside } from "../utils/graph";

export const BoxSelection = memo(function BoxSelection({
  selectionKeyPressed,
}) {
  const transform = useStoreState((state) => state.transform);

  const [selectionRect, setSelectionRect] = useState(null);

  const appState = useNodesPositionsContext();
  const addSelectedElements = useAddSelectedElements();

  if (!(selectionRect != null || selectionKeyPressed)) {
    return null;
  }
  const onMouseDown = (event) => {
    const mousePos = getMousePosition(event);
    if (!mousePos) {
      return;
    }
    setSelectionRect({
      width: 0,
      height: 0,
      startX: mousePos.x,
      startY: mousePos.y,
      x: mousePos.x,
      y: mousePos.y,
    });
  };
  const onMouseMove = (event) => {
    if (!selectionKeyPressed || selectionRect == null) {
      return;
    }
    const mousePos = getMousePosition(event);
    if (!mousePos) {
      return;
    }

    const startX = selectionRect.startX ?? 0;
    const startY = selectionRect.startY ?? 0;
    const nextSelectionRect = {
      ...selectionRect,
      x: mousePos.x < startX ? mousePos.x : selectionRect.x,
      y: mousePos.y < startY ? mousePos.y : selectionRect.y,
      width: Math.abs(mousePos.x - startX),
      height: Math.abs(mousePos.y - startY),
    };
    const selectedNodes = getNodesInside(
      appState,
      nextSelectionRect,
      transform,
      false,
      true
    );
    addSelectedElements(selectedNodes);
    setSelectionRect(nextSelectionRect);
  };
  const cancelSelection = () => {
    setSelectionRect(null);
  };
  return (
    <FillParent
      css={{ zIndex: "$uiAboveNodes" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={cancelSelection}
      onMouseLeave={cancelSelection}
    >
      <SelectionRect rect={selectionRect} />
    </FillParent>
  );
});

const SelectionRect = ({ rect }) => {
  if (rect == null) {
    return null;
  }
  return (
    <Box
      css={{
        position: "absolute",
        top: 0,
        left: 0,
        background: "rgba(0, 89, 220, 0.08)",
        border: "1px dotted rgba(0, 89, 220, 0.8)",
        width: rect.width,
        height: rect.height,
        transform: `translate(${rect.x}px, ${rect.y}px)`,
      }}
    />
  );
};

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
