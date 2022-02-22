import React from "react";
import { Position } from "../types";
import { BezierEdge } from "./Edges/BezierEdge";

export function ConnectionLine({
  connectionNodeId,
  connectionHandleId,
  connectionHandleType,
  connectionPositionX,
  connectionPositionY,
  sourceNode,
  transform,
  isConnectable,
}) {
  const handleId = connectionHandleId;
  if (sourceNode == null || !isConnectable) {
    return null;
  }
  const sourceHandle = getSourceHandle(
    handleId,
    sourceNode,
    connectionHandleType
  );
  const sourceHandleX = sourceHandle
    ? sourceHandle.x + sourceHandle.width / 2
    : sourceNode.width / 2;
  const sourceHandleY = sourceHandle
    ? sourceHandle.y + sourceHandle.height / 2
    : sourceNode.height;
  const sourceX = sourceNode.x + sourceHandleX;
  const sourceY = sourceNode.y + sourceHandleY;
  const targetX = (connectionPositionX - transform[0]) / transform[2];
  const targetY = (connectionPositionY - transform[1]) / transform[2];
  const isRightOrLeft =
    sourceHandle?.position === Position.Left ||
    sourceHandle?.position === Position.Right;

  return (
    <OrientedConnectionLine
      source={[sourceX, sourceY, sourceHandle?.position]}
      target={[targetX, targetY, isRightOrLeft ? Position.Left : Position.Top]}
      connectionHandleType={connectionHandleType}
    />
  );
}

function OrientedConnectionLine({ source, target, connectionHandleType }) {
  const [
    [sourceX, sourceY, sourcePosition],
    [targetX, targetY, targetPosition],
  ] = connectionHandleType === "source" ? [source, target] : [target, source];
  return (
    <BezierEdge
      {...{
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      }}
    />
  );
}

const getSourceHandle = (handleId, sourceNode, connectionHandleType) => {
  const handleTypeInverted =
    connectionHandleType === "source" ? "target" : "source";
  const handleBound =
    sourceNode.handleBounds[connectionHandleType] ||
    sourceNode.handleBounds[handleTypeInverted];
  return handleId ? handleBound.find((d) => d.id === handleId) : handleBound[0];
};
