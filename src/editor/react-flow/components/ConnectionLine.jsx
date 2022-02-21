import React from "react";
import { Position } from "../types";
import { getBezierPath } from "./Edges/BezierEdge";
import { Group } from "./Group";
import { Path } from "./Path";

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
  // TODO: Use the same smart path as edges
  return (
    <Group css={{ pointerEvents: "none" }}>
      <Path
        d={getBezierPath({
          sourceX,
          sourceY,
          sourcePosition: sourceHandle?.position,
          targetX,
          targetY,
          targetPosition: isRightOrLeft ? Position.Left : Position.Top,
        })}
        css={{
          fill: "none",
          stroke: "$slate9",
          strokeWidth: 1,
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
