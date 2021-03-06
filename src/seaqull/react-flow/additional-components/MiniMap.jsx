import React, { memo } from "react";
import cc from "classcat";
import { useStoreState } from "../store/hooks";
import { getRectOfNodes, getBoundsofRects } from "../utils/graph";
import { styled } from "ui/styled/style";

const defaultWidth = 200;
const defaultHeight = 150;

export const MiniMap = memo(function ({
  style,
  className,
  nodeStrokeColor = "#555",
  nodeColor = "#fff",
  nodeClassName = "",
  nodeBorderRadius = 5,
  nodeStrokeWidth = 2,
  maskColor = "rgb(240, 242, 243, 0.7)",
}) {
  const containerWidth = useStoreState((s) => s.width);
  const containerHeight = useStoreState((s) => s.height);
  const [tX, tY, tScale] = useStoreState((s) => s.transform);
  const nodes = useStoreState((s) => s.nodes);
  const mapClasses = cc(["react-flow__minimap", className]);
  const elementWidth = style?.width || defaultWidth;
  const elementHeight = style?.height || defaultHeight;
  const nodeColorFunc =
    nodeColor instanceof Function ? nodeColor : () => nodeColor;
  const nodeStrokeColorFunc =
    nodeStrokeColor instanceof Function
      ? nodeStrokeColor
      : () => nodeStrokeColor;
  const nodeClassNameFunc =
    nodeClassName instanceof Function ? nodeClassName : () => nodeClassName;
  const hasNodes = nodes && nodes.length;
  const bb = getRectOfNodes(nodes);
  const viewBB = {
    x: -tX / tScale,
    y: -tY / tScale,
    width: containerWidth / tScale,
    height: containerHeight / tScale,
  };
  const boundingRect = hasNodes ? getBoundsofRects(bb, viewBB) : viewBB;
  const scaledWidth = boundingRect.width / elementWidth;
  const scaledHeight = boundingRect.height / elementHeight;
  const viewScale = Math.max(scaledWidth, scaledHeight);
  const viewWidth = viewScale * elementWidth;
  const viewHeight = viewScale * elementHeight;
  const offset = 5 * viewScale;
  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  const width = viewWidth + offset * 2;
  const height = viewHeight + offset * 2;
  const shapeRendering =
    typeof window === "undefined" || !!window.chrome
      ? "crispEdges"
      : "geometricPrecision";
  return (
    <svg
      width={elementWidth}
      height={elementHeight}
      viewBox={`${x} ${y} ${width} ${height}`}
      style={style}
      className={mapClasses}
    >
      {nodes
        .filter((node) => !node.isHidden)
        .map((node) => (
          <MiniMapNode
            key={node.id}
            x={node.__rf.position.x}
            y={node.__rf.position.y}
            width={node.__rf.width}
            height={node.__rf.height}
            style={node.style}
            className={nodeClassNameFunc(node)}
            color={nodeColorFunc(node)}
            borderRadius={nodeBorderRadius}
            strokeColor={nodeStrokeColorFunc(node)}
            strokeWidth={nodeStrokeWidth}
            shapeRendering={shapeRendering}
          />
        ))}
      <path
        className="react-flow__minimap-mask"
        d={`M${x - offset},${y - offset}h${width + offset * 2}v${
          height + offset * 2
        }h${-width - offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${
          viewBB.height
        }h${-viewBB.width}z`}
        fill={maskColor}
        fillRule="evenodd"
      />
    </svg>
  );
});

const MiniMapNode = memo(function MiniMapNode({
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
