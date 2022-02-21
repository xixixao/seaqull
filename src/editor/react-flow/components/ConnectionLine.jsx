import React from "react";
import { ConnectionLineType, Position } from "../types";
import { getBezierPath } from "./Edges/BezierEdge";
import { getSmoothStepPath } from "./Edges/SmoothStepEdge";
import { Group } from "./Group";
import { Path } from "./Path";

export default function ConnectionLine({
  connectionNodeId,
  connectionHandleId,
  connectionHandleType,
  connectionPositionX,
  connectionPositionY,
  connectionLineType = ConnectionLineType.Bezier,
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
  const targetPosition = isRightOrLeft ? Position.Left : Position.Top;
  let dAttr = "";
  // TODO: Use the same smart path as edges
  if (connectionLineType === ConnectionLineType.Bezier) {
    dAttr = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition: sourceHandle?.position,
      targetX,
      targetY,
      targetPosition,
    });
  } else if (connectionLineType === ConnectionLineType.Step) {
    dAttr = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: sourceHandle?.position,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 0,
    });
  } else if (connectionLineType === ConnectionLineType.SmoothStep) {
    dAttr = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: sourceHandle?.position,
      targetX,
      targetY,
      targetPosition,
    });
  } else {
    dAttr = `M${sourceX},${sourceY} ${targetX},${targetY}`;
  }
  return (
    <Group css={{ pointerEvents: "none" }}>
      <Path
        d={dAttr}
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
