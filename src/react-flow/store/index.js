import configureStore from "./configure-store";
import { ConnectionMode } from "../types";
export const initialState = {
  width: 0,
  height: 0,
  transform: [0, 0, 1],
  nodes: [],
  edges: [],
  selectedElements: null,
  selectedNodesBbox: { x: 0, y: 0, width: 0, height: 0 },
  d3Zoom: null,
  d3Selection: null,
  d3ZoomHandler: undefined,
  minZoom: 0.5,
  maxZoom: 2,
  translateExtent: [
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ],
  nodeExtent: [
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ],
  nodesSelectionActive: false,
  selectionActive: false,
  userSelectionRect: {
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    draw: false,
  },
  connectionNodeId: null,
  connectionHandleId: null,
  connectionHandleType: "source",
  connectionPosition: { x: 0, y: 0 },
  connectionMode: ConnectionMode.Strict,
  snapGrid: [15, 15],
  snapToGrid: false,
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  multiSelectionActive: false,
  reactFlowVersion: "-",
};
const store = configureStore(initialState);
export default store;
