import React, { memo } from "react";
// import EdgeText from "./EdgeText";
import { getCenter } from "./utils";
import { Position } from "../../types";
import { Group } from "../Group";

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
  return (
    <>
      <Group
        css={{
          color: "$slate9",
          // TODO: Dont use classes, use React props instead
          ".updating &": {
            color: "$slate12",
          },
        }}
      >
        <path fill="none" stroke="currentColor" strokeWidth={1} d={path} />
        <g transform={`translate(${targetX},${targetY})`}>
          <polyline
            stroke="currentColor"
            fill="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </g>
      </Group>
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
  if (
    leftAndRight.includes(sourcePosition) &&
    leftAndRight.includes(targetPosition)
  ) {
    return `M${sourceX},${sourceY} C${cX},${sourceY} ${cX},${targetY} ${targetX},${targetY}`;
  } else if (leftAndRight.includes(targetPosition)) {
    return `M${sourceX},${sourceY} Q${sourceX},${targetY} ${targetX},${targetY}`;
  } else if (leftAndRight.includes(sourcePosition)) {
    return `M${sourceX},${sourceY} Q${targetX},${sourceY} ${targetX},${targetY}`;
  } else {
    return `M${sourceX},${sourceY} C${sourceX},${cY} ${targetX},${cY} ${targetX},${targetY}`;
  }
}
