/**
 * The nodes selection rectangle gets displayed when a user
 * made a selectio  with on or several nodes
 */
import { Box } from "editor/ui/Box";
import React, { useMemo, useCallback, useRef } from "react";
import ReactDraggable from "react-draggable";
import { useStoreState, useStoreActions } from "../store/hooks";
import { isNode } from "../utils/graph";

export function NodesSelection({
  onSelectionDragStart,
  onSelectionDrag,
  onSelectionDragStop,
  onSelectionContextMenu,
}) {
  const [tX, tY, tScale] = useStoreState((state) => state.transform);
  const selectedNodesBbox = useStoreState((state) => state.selectedNodesBbox);
  const selectionActive = useStoreState((state) => state.selectionActive);
  const selectedElements = useStoreState((state) => state.selectedElements);
  const snapToGrid = useStoreState((state) => state.snapToGrid);
  const snapGrid = useStoreState((state) => state.snapGrid);
  const nodes = useStoreState((state) => state.nodes);
  const updateNodePosDiff = useStoreActions(
    (actions) => actions.updateNodePosDiff
  );
  const nodeRef = useRef(null);
  const grid = useMemo(
    () => (snapToGrid ? snapGrid : [1, 1]),
    [snapToGrid, snapGrid]
  );
  const selectedNodes = useMemo(
    () =>
      selectedElements
        ? selectedElements.filter(isNode).map((selectedNode) => {
            const matchingNode = nodes.find(
              (node) => node.id === selectedNode.id
            );
            return {
              ...matchingNode,
              position: matchingNode?.__rf.position,
            };
          })
        : [],
    [selectedElements, nodes]
  );
  const innerStyle = useMemo(
    () => ({
      width: selectedNodesBbox.width,
      height: selectedNodesBbox.height,
      top: selectedNodesBbox.y,
      left: selectedNodesBbox.x,
    }),
    [selectedNodesBbox]
  );
  const onStart = useCallback(
    (event) => {
      onSelectionDragStart?.(event, selectedNodes);
    },
    [onSelectionDragStart, selectedNodes]
  );
  const onDrag = useCallback(
    (event, data) => {
      if (onSelectionDrag) {
        onSelectionDrag(event, selectedNodes);
      }
      updateNodePosDiff({
        diff: {
          x: data.deltaX,
          y: data.deltaY,
        },
        isDragging: true,
      });
    },
    [onSelectionDrag, selectedNodes, updateNodePosDiff]
  );
  const onStop = useCallback(
    (event) => {
      updateNodePosDiff({
        isDragging: false,
      });
      onSelectionDragStop?.(event, selectedNodes);
    },
    [selectedNodes, onSelectionDragStop]
  );
  const onContextMenu = useCallback(
    (event) => {
      const selectedNodes = selectedElements
        ? selectedElements
            .filter(isNode)
            .map((selectedNode) =>
              nodes.find((node) => node.id === selectedNode.id)
            )
        : [];
      onSelectionContextMenu?.(event, selectedNodes);
    },
    [onSelectionContextMenu]
  );
  if (!selectedElements || selectionActive) {
    return null;
  }
  return (
    <Box
      css={{
        zIndex: "$nodeEditor",
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        transformOrigin: "left top",
        pointerEvents: "none",
        transform: `translate(${tX}px,${tY}px) scale(${tScale})`,
      }}
    >
      <ReactDraggable
        scale={tScale}
        grid={grid}
        onStart={(event) => onStart(event)}
        onDrag={(event, data) => onDrag(event, data)}
        onStop={(event) => onStop(event)}
        nodeRef={nodeRef}
        enableUserSelectHack={false}
      >
        <Box
          css={{
            background: "rgba(0, 89, 220, 0.08)",
            border: "1px dotted rgba(0, 89, 220, 0.8)",
          }}
          ref={nodeRef}
          className="react-flow__nodesselection-rect"
          onContextMenu={onContextMenu}
          style={innerStyle}
        />
      </ReactDraggable>
    </Box>
  );
}
