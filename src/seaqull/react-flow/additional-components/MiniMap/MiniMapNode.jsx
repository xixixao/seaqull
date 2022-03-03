import React, { memo } from "react";
import { styled } from "seaqull/style";

export const MiniMapNode = memo(function MiniMapNode({
  x,
  y,
  width,
  height,
  style,
  color,
  strokeColor,
  strokeWidth,
  className,
  borderRadius,
  shapeRendering,
}) {
  const { background, backgroundColor } = style || {};
  const fill = color || background || backgroundColor;
  return (
    <Rect
      css={{
        position: "absolute",
        zIndex: 5,
        bottom: "10px",
        right: "10px",
        backgroundColor: "#fff",
      }}
      x={x}
      y={y}
      rx={borderRadius}
      ry={borderRadius}
      width={width}
      height={height}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      shapeRendering={shapeRendering}
    />
  );
});

const Rect = styled("rect");
