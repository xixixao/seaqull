import React, { memo } from "react";
import cc from "classcat";
const MiniMapNode = ({
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
}) => {
  const { background, backgroundColor } = style || {};
  const fill = color || background || backgroundColor;
  return (
    <rect
      className={cc(["react-flow__minimap-node", className])}
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
};
MiniMapNode.displayName = "MiniMapNode";
export default memo(MiniMapNode);
