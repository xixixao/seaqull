import React, { memo, useMemo } from "react";
import { useAppStateContext } from "../../../state";
import { useStoreState } from "../../store/hooks";
import { useUpdateNodeDimensions } from "../../store/reducer";
import { getNodesInside } from "../../utils/graph";
import * as Nodes from "graph/Nodes";

const NodeRenderer = (props) => {
  const transform = useStoreState((state) => state.transform);
  const nodesDraggable = useStoreState((state) => state.nodesDraggable);
  const nodesConnectable = useStoreState((state) => state.nodesConnectable);
  const elementsSelectable = useStoreState((state) => state.elementsSelectable);
  const updateNodeDimensions = useUpdateNodeDimensions();
  const width = useStoreState((state) => state.width);
  const height = useStoreState((state) => state.height);
  const appState = useAppStateContext();
  const nodes = Array.from(appState.nodes.values());
  const visibleNodes = props.onlyRenderVisibleElements
    ? getNodesInside(nodes, { x: 0, y: 0, width, height }, transform, true)
    : nodes;
  const transformStyle = useMemo(
    () => ({
      transform: `translate(${transform[0]}px,${transform[1]}px) scale(${transform[2]})`,
    }),
    [transform[0], transform[1], transform[2]]
  );
  const resizeObserver = useMemo(() => {
    if (typeof ResizeObserver === "undefined") {
      return null;
    }
    return new ResizeObserver((entries) => {
      const updates = entries.map((entry) => ({
        id: entry.target.getAttribute("data-id"),
        nodeElement: entry.target,
      }));
      updateNodeDimensions(updates);
    });
  }, [updateNodeDimensions]);
  return (
    <div className="react-flow__nodes" style={transformStyle}>
      {visibleNodes.map((node) => {
        const position = Nodes.positionOf(appState, node);
        const nodeType = node.type || "default";
        const NodeComponent =
          props.nodeTypes[nodeType] || props.nodeTypes.default;
        if (!props.nodeTypes[nodeType]) {
          console.warn(
            `Node type "${nodeType}" not found. Using fallback type "default".`
          );
        }
        const isDraggable = !!(
          node.draggable ||
          (nodesDraggable && typeof node.draggable === "undefined")
        );
        const isSelectable = !!(
          node.selectable ||
          (elementsSelectable && typeof node.selectable === "undefined")
        );
        const isConnectable = !!(
          node.connectable ||
          (nodesConnectable && typeof node.connectable === "undefined")
        );
        return (
          <NodeComponent
            key={node.id}
            id={node.id}
            className={node.className}
            style={node.style}
            type={nodeType}
            data={node.data}
            sourcePosition={node.sourcePosition}
            targetPosition={node.targetPosition}
            isHidden={node.isHidden}
            xPos={position.x}
            yPos={position.y}
            isDragging={position.isDragging}
            isInitialized={position.width !== null && position.height !== null}
            snapGrid={props.snapGrid}
            snapToGrid={props.snapToGrid}
            selectNodesOnDrag={props.selectNodesOnDrag}
            onClick={props.onElementClick}
            onMouseEnter={props.onNodeMouseEnter}
            onMouseMove={props.onNodeMouseMove}
            onMouseLeave={props.onNodeMouseLeave}
            onContextMenu={props.onNodeContextMenu}
            onNodeDoubleClick={props.onNodeDoubleClick}
            onNodeDragStart={props.onNodeDragStart}
            onNodeDrag={props.onNodeDrag}
            onNodeDragStop={props.onNodeDragStop}
            scale={transform[2]}
            selected={Nodes.hasSelected(appState, node)}
            highlight={appState.highlightedNodeIDs.has(node.id)}
            isDraggable={isDraggable}
            isSelectable={isSelectable}
            isConnectable={isConnectable}
            resizeObserver={resizeObserver}
            dragHandle={node.dragHandle}
          />
        );
      })}
    </div>
  );
};
NodeRenderer.displayName = "NodeRenderer";
export default memo(NodeRenderer);
