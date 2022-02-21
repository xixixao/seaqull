import React, { memo, useCallback, useContext } from "react";
import * as Edges from "graph/Edges";
import * as Nodes from "graph/Nodes";
import * as Node from "graph/Node";
import { AppStateContext, useAppStateContext } from "../../../state";
import ConnectionLine from "../../components/ConnectionLine";
import { useStoreState } from "../../store/hooks";
import { Position } from "../../types";
import { isEdge } from "../../utils/graph";
import { getEdgePositions, getHandle, isEdgeVisible } from "./utils";

export const EdgeRenderer = memo(function EdgeRenderer(props) {
  const transform = useStoreState((state) => state.transform);
  const appState = useAppStateContext();
  const edges = useContext(AppStateContext.edges);
  const connectionNodeId = useStoreState((state) => state.connectionNodeId);
  const connectionHandleId = useStoreState((state) => state.connectionHandleId);
  const connectionHandleType = useStoreState(
    (state) => state.connectionHandleType
  );
  const connectionPosition = useStoreState((state) => state.connectionPosition);
  const selectedElements = useStoreState((state) => state.selectedElements);
  const nodesConnectable = useStoreState((state) => state.nodesConnectable);
  const elementsSelectable = useStoreState((state) => state.elementsSelectable);
  const width = useStoreState((state) => state.width);
  const height = useStoreState((state) => state.height);

  const isValidConnection = useCallback(
    ({ source, target }) => {
      return (
        !Edges.isTightAncestor(
          appState,
          Node.fake(source),
          Node.fake(target)
        ) &&
        !Edges.isTightAncestor(
          appState,
          Node.fake(target),
          Node.fake(source)
        ) &&
        !Node.is(Node.fake(target), Node.fake(source))
      );
    },
    [appState]
  );

  if (!width) {
    return null;
  }
  const { onlyRenderVisibleElements } = props;
  const transformStyle = `translate(${transform[0]},${transform[1]}) scale(${transform[2]})`;
  const renderConnectionLine = connectionNodeId && connectionHandleType;
  return (
    <svg width={width} height={height} className="react-flow__edges">
      <g transform={transformStyle}>
        {Array.from(edges.values()).map((edge) => (
          <Edge
            key={edge.id}
            edge={edge}
            props={props}
            appState={appState}
            selectedElements={selectedElements}
            elementsSelectable={elementsSelectable}
            transform={transform}
            width={width}
            height={height}
            onlyRenderVisibleElements={onlyRenderVisibleElements}
            isValidConnection={isValidConnection}
          />
        ))}
        {renderConnectionLine && (
          <ConnectionLine
            sourceNode={Nodes.positionOf(appState, Node.fake(connectionNodeId))}
            connectionNodeId={connectionNodeId}
            connectionHandleId={connectionHandleId}
            connectionHandleType={connectionHandleType}
            connectionPositionX={connectionPosition.x}
            connectionPositionY={connectionPosition.y}
            transform={transform}
            isConnectable={nodesConnectable}
          />
        )}
      </g>
    </svg>
  );
});

function Edge({
  edge,
  props,
  appState,
  selectedElements,
  elementsSelectable,
  transform,
  width,
  height,
  onlyRenderVisibleElements,
  connectionMode,
  isValidConnection,
}) {
  const sourceHandleId = edge.sourceHandle || null;
  const targetHandleId = edge.targetHandle || null;
  // TODO: We shouldnt need full appState, only edges and positions to do this
  const sourceNode = Edges.parentNode(appState, edge);
  const targetNode = Edges.childNode(appState, edge);
  // const { sourceNode, targetNode } = getSourceTargetNodes(edge, nodes);
  const { onEdgeUpdate } = props;
  const onConnectEdge = useCallback(
    (connection) => {
      onEdgeUpdate?.(edge, connection);
    },
    [edge, onEdgeUpdate]
  );
  if (!sourceNode) {
    console.warn(
      `couldn't create edge for parent id: ${edge.parentID}; edge id: ${edge.id}`
    );
    return null;
  }
  if (!targetNode) {
    console.warn(
      `couldn't create edge for child id: ${edge.childID}; edge id: ${edge.id}`
    );
    return null;
  }
  const sourcePos = Nodes.positionOf(appState, sourceNode);
  const targetPos = Nodes.positionOf(appState, targetNode);
  // source and target node need to be initialized
  if (!sourcePos.width || !targetPos.width) {
    return null;
  }
  const edgeType = edge.type || "default";
  const EdgeComponent = props.edgeTypes[edgeType] || props.edgeTypes.default;
  const targetNodeBounds = targetPos.handleBounds;
  // when connection type is loose we can define all handles as sources
  // const targetNodeHandles =
  //   connectionMode === ConnectionMode.Strict
  //     ? targetNodeBounds.target
  //     : targetNodeBounds.target || targetNodeBounds.source;
  const targetNodeHandles = true
    ? targetNodeBounds.target
    : targetNodeBounds.target || targetNodeBounds.source;
  const sourceHandle = getHandle(sourcePos.handleBounds.source, sourceHandleId);
  const targetHandle = getHandle(targetNodeHandles, targetHandleId);
  const sourcePosition = sourceHandle ? sourceHandle.position : Position.Bottom;
  const targetPosition = targetHandle ? targetHandle.position : Position.Top;
  if (!sourceHandle) {
    console.warn(
      `couldn't create edge for source handle id: ${sourceHandleId}; edge id: ${edge.id}`
    );
    return null;
  }
  if (!targetHandle) {
    console.warn(
      `couldn't create edge for target handle id: ${targetHandleId}; edge id: ${edge.id}`
    );
    return null;
  }
  const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
    sourceHandle,
    sourcePos,
    sourcePosition,
    targetHandle,
    targetPos,
    targetPosition
  );
  const isVisible = onlyRenderVisibleElements
    ? isEdgeVisible({
        sourcePos: { x: sourceX, y: sourceY },
        targetPos: { x: targetX, y: targetY },
        width,
        height,
        transform,
      })
    : true;
  if (!isVisible) {
    return null;
  }
  const isSelected =
    selectedElements?.some((elm) => isEdge(elm) && elm.id === edge.id) || false;
  return (
    <EdgeComponent
      key={edge.id}
      id={edge.id}
      className={edge.className}
      type={edge.type}
      data={edge.data}
      onClick={props.onElementClick}
      selected={isSelected}
      animated={edge.animated}
      label={edge.label}
      labelStyle={edge.labelStyle}
      labelShowBg={edge.labelShowBg}
      labelBgStyle={edge.labelBgStyle}
      labelBgPadding={edge.labelBgPadding}
      labelBgBorderRadius={edge.labelBgBorderRadius}
      // style={edge.style}
      arrowHeadType={edge.arrowHeadType}
      source={edge.parentID}
      target={edge.childID}
      sourceHandleId={sourceHandleId}
      targetHandleId={targetHandleId}
      sourceX={sourceX}
      sourceY={sourceY}
      targetX={targetX}
      targetY={targetY}
      sourcePosition={sourcePosition}
      targetPosition={targetPosition}
      elementsSelectable={elementsSelectable}
      markerEndId={props.markerEndId}
      isHidden={edge.isHidden || edge.type === "tight"}
      onConnectEdge={onConnectEdge}
      handleEdgeUpdate={typeof props.onEdgeUpdate !== "undefined"}
      isValidConnection={isValidConnection}
      onContextMenu={props.onEdgeContextMenu}
      onMouseEnter={props.onEdgeMouseEnter}
      onMouseMove={props.onEdgeMouseMove}
      onMouseLeave={props.onEdgeMouseLeave}
      edgeUpdaterRadius={props.edgeUpdaterRadius}
      onEdgeDoubleClick={props.onEdgeDoubleClick}
    />
  );
}
