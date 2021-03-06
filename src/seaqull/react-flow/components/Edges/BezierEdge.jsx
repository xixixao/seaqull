import React, { memo } from "react";
// import EdgeText from "./EdgeText";
import { getCenter } from "./utils";
import { Position } from "../../types";
import { Group } from "../Group";
import { Path } from "../Path";
import { keyframes } from "ui/styled/style";

export const BezierEdge = memo(function BezierEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
  isDragged,
  // label,
  // labelStyle,
  // labelShowBg,
  // labelBgStyle,
  // labelBgPadding,
  // labelBgBorderRadius,
  // style,
}) {
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
          ...(isDragged
            ? {}
            : {
                // TODO: Dont use classes, use React props instead
                ".updating &": {
                  color: "$slate12",
                },
              }),
        }}
      >
        <Path
          css={
            isDragged
              ? {
                  strokeDasharray: 5,
                  animation: `${dashDraw} 0.5s linear infinite`,
                }
              : {}
          }
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          d={getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
          })}
        />
        <g transform={`translate(${targetX},${targetY})`}>
          <polygon
            stroke="currentColor"
            fill="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            points="-4,-3 0,0 -4,3"
          />
        </g>
      </Group>
      {/* text */}
    </>
  );
});

function getBezierPath({
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
    const verticalDistance = Math.min(100, Math.abs(targetY - sourceY));
    const offset = Math.max(0, sourceX - targetX + verticalDistance);
    const sourceControlX = Math.max(cX, sourceX + offset + 0);
    const targetControlX = Math.min(cX, targetX - offset - 0);
    return `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
  } else if (leftAndRight.includes(targetPosition)) {
    return `M${sourceX},${sourceY} Q${sourceX},${targetY} ${targetX},${targetY}`;
  } else if (leftAndRight.includes(sourcePosition)) {
    return `M${sourceX},${sourceY} Q${targetX},${sourceY} ${targetX},${targetY}`;
  } else {
    return `M${sourceX},${sourceY} C${sourceX},${cY} ${targetX},${cY} ${targetX},${targetY}`;
  }
}

const dashDraw = keyframes({
  from: { strokeDashoffset: 10 },
});
