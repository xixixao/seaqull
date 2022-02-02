import {
  BezierEdge,
  StepEdge,
  SmoothStepEdge,
  StraightEdge,
} from "../../components/Edges";
import wrapEdge from "../../components/Edges/wrapEdge";
import { rectToBox } from "../../utils/graph";
import { Position } from "../../types";
export function createEdgeTypes(edgeTypes) {
  const standardTypes = {
    default: wrapEdge(edgeTypes.default || BezierEdge),
    straight: wrapEdge(edgeTypes.bezier || StraightEdge),
    step: wrapEdge(edgeTypes.step || StepEdge),
    smoothstep: wrapEdge(edgeTypes.step || SmoothStepEdge),
  };
  const wrappedTypes = {};
  const specialTypes = Object.keys(edgeTypes)
    .filter((k) => !["default", "bezier"].includes(k))
    .reduce((res, key) => {
      res[key] = wrapEdge(edgeTypes[key] || BezierEdge);
      return res;
    }, wrappedTypes);
  return {
    ...standardTypes,
    ...specialTypes,
  };
}
export function getHandlePosition(position, pos, handle = null) {
  const x = (handle?.x || 0) + pos.x;
  const y = (handle?.y || 0) + pos.y;
  const width = handle?.width || pos.width;
  const height = handle?.height || pos.height;
  switch (position) {
    case Position.Top:
      return {
        x: x + width / 2,
        y,
      };
    case Position.Right:
      return {
        x: x + width,
        y: y + height / 2,
      };
    case Position.Bottom:
      return {
        x: x + width / 2,
        y: y + height,
      };
    case Position.Left:
      return {
        x,
        y: y + height / 2,
      };
  }
}

export function getHandle(bounds, handleId) {
  if (!bounds) {
    return null;
  }
  // there is no handleId when there are no multiple handles/ handles with ids
  // so we just pick the first one
  let handle = null;
  if (bounds.length === 1 || !handleId) {
    handle = bounds[0];
  } else if (handleId) {
    handle = bounds.find((d) => d.id === handleId);
  }
  return typeof handle === "undefined" ? null : handle;
}

export const getEdgePositions = (
  sourceHandle,
  sourcePos,
  sourcePosition,
  targetHandle,
  targetPos,
  targetPosition
) => {
  const sourceHandlePos = getHandlePosition(
    sourcePosition,
    sourcePos,
    sourceHandle
  );
  const targetHandlePos = getHandlePosition(
    targetPosition,
    targetPos,
    targetHandle
  );
  return {
    sourceX: sourceHandlePos.x,
    sourceY: sourceHandlePos.y,
    targetX: targetHandlePos.x,
    targetY: targetHandlePos.y,
  };
};

export function isEdgeVisible({
  sourcePos,
  targetPos,
  width,
  height,
  transform,
}) {
  const edgeBox = {
    x: Math.min(sourcePos.x, targetPos.x),
    y: Math.min(sourcePos.y, targetPos.y),
    x2: Math.max(sourcePos.x, targetPos.x),
    y2: Math.max(sourcePos.y, targetPos.y),
  };
  if (edgeBox.x === edgeBox.x2) {
    edgeBox.x2 += 1;
  }
  if (edgeBox.y === edgeBox.y2) {
    edgeBox.y2 += 1;
  }
  const viewBox = rectToBox({
    x: (0 - transform[0]) / transform[2],
    y: (0 - transform[1]) / transform[2],
    width: width / transform[2],
    height: height / transform[2],
  });
  const xOverlap = Math.max(
    0,
    Math.min(viewBox.x2, edgeBox.x2) - Math.max(viewBox.x, edgeBox.x)
  );
  const yOverlap = Math.max(
    0,
    Math.min(viewBox.y2, edgeBox.y2) - Math.max(viewBox.y, edgeBox.y)
  );
  const overlappingArea = Math.ceil(xOverlap * yOverlap);
  return overlappingArea > 0;
}
export const getSourceTargetNodes = (edge, nodes) => {
  return;
  return nodes.reduce(
    (res, node) => {
      if (node.id === edge.parentID) {
        res.sourceNode = node;
      }
      if (node.id === edge.childID) {
        res.targetNode = node;
      }
      return res;
    },
    { sourceNode: null, targetNode: null }
  );
};
