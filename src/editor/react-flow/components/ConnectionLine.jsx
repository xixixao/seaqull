import React from "react";
import { Position } from "../types";
import { BezierEdge } from "./Edges/BezierEdge";
import { Group } from "./Group";

export default function ConnectionLine({
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
    <Group css={{ pointerEvents: "none" }}>
      <BezierEdge
        {...{
          sourceX,
          sourceY,
          sourcePosition: sourceHandle?.position,
          targetX,
          targetY,
          targetPosition: isRightOrLeft ? Position.Left : Position.Top,
        }}
      />
    </Group>
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
