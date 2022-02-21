import React, { memo } from "react";
// import EdgeText from "./EdgeText";
import { getMarkerEnd, getCenter } from "./utils";
import { Position } from "../../types";
import { Path } from "../Path";

export const BezierEdge = memo(function BezierEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
  // label,
  // labelStyle,
  // labelShowBg,
  // labelBgStyle,
  // labelBgPadding,
  // labelBgBorderRadius,
  // style,
  arrowHeadType,
  markerEndId,
}) {
  const path = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  // const [centerX, centerY] = getCenter({
  //   sourceX,
  //   sourceY,
  //   targetX,
  //   targetY,
  //   sourcePosition,
  //   targetPosition,
  // });
  // TODO: In case we need labels, possible to label LEFT and RIGHT
  // in JOIN / LEFT?
  // const text = label ? (
  //   <EdgeText
  //     x={centerX}
  //     y={centerY}
  //     label={label}
  //     labelStyle={labelStyle}
  //     labelShowBg={labelShowBg}
  //     labelBgStyle={labelBgStyle}
  //     labelBgPadding={labelBgPadding}
  //     labelBgBorderRadius={labelBgBorderRadius}
  //   />
  // ) : null;
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
  return (
    <>
      <Path
        css={{
          fill: "none",
          stroke: "$slate9",
          strokeWidth: 1,
          // TODO: Dont use classes, use React props instead
          ".updating &": {
            stroke: "$slate12",
          },
          // ".selected &": {
          //   stroke: "red",
          // },
        }}
        d={path}
        markerEnd={markerEnd}
      />
      {/* text */}
    </>
  );
});

export function getBezierPath({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  centerX,
  centerY,
}) {
  const [_centerX, _centerY] = getCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const leftAndRight = [Position.Left, Position.Right];
  const cX = typeof centerX !== "undefined" ? centerX : _centerX;
  const cY = typeof centerY !== "undefined" ? centerY : _centerY;
  let path = `M${sourceX},${sourceY} C${sourceX},${cY} ${targetX},${cY} ${targetX},${targetY}`;
  if (
    leftAndRight.includes(sourcePosition) &&
    leftAndRight.includes(targetPosition)
  ) {
    path = `M${sourceX},${sourceY} C${cX},${sourceY} ${cX},${targetY} ${targetX},${targetY}`;
  } else if (leftAndRight.includes(targetPosition)) {
    path = `M${sourceX},${sourceY} Q${sourceX},${targetY} ${targetX},${targetY}`;
  } else if (leftAndRight.includes(sourcePosition)) {
    path = `M${sourceX},${sourceY} Q${targetX},${sourceY} ${targetX},${targetY}`;
  }
  return path;
}
