import React from "react";
import { ConnectionLineType, Position } from "../../types";
import { getBezierPath } from "../Edges/BezierEdge";
import { getSmoothStepPath } from "../Edges/SmoothStepEdge";

const getSourceHandle = (handleId, sourceNode, connectionHandleType) => {
  const handleTypeInverted =
    connectionHandleType === "source" ? "target" : "source";
  const handleBound =
    sourceNode.handleBounds[connectionHandleType] ||
    sourceNode.handleBounds[handleTypeInverted];
  return handleId ? handleBound.find((d) => d.id === handleId) : handleBound[0];
};

export default function ConnectionLine({
  connectionNodeId,
  connectionHandleId,
  connectionHandleType,
  connectionLineStyle,
  connectionPositionX,
  connectionPositionY,
  connectionLineType = ConnectionLineType.Bezier,
  sourceNode,
  transform,
  isConnectable,
  CustomConnectionLineComponent,
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
  if (CustomConnectionLineComponent) {
    return (
      <g className="react-flow__connection">
        <CustomConnectionLineComponent
          sourceX={sourceX}
          sourceY={sourceY}
          sourcePosition={sourceHandle?.position}
          targetX={targetX}
          targetY={targetY}
          targetPosition={targetPosition}
          connectionLineType={connectionLineType}
          connectionLineStyle={connectionLineStyle}
          sourceNode={sourceNode}
          sourceHandle={sourceHandle}
        />
      </g>
    );
  }
  let dAttr = "";
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
    <g className="react-flow__connection">
      <path
        d={dAttr}
        className="react-flow__connection-path"
        style={connectionLineStyle}
      />
    </g>
  );
}
