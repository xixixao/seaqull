import { createAction } from "./utils";
import * as constants from "./contants";
export const setOnConnect = (onConnect) =>
  createAction(constants.SET_ON_CONNECT, {
    onConnect,
  });
export const setOnConnectStart = (onConnectStart) =>
  createAction(constants.SET_ON_CONNECT_START, {
    onConnectStart,
  });
export const setOnConnectStop = (onConnectStop) =>
  createAction(constants.SET_ON_CONNECT_STOP, {
    onConnectStop,
  });
export const setOnConnectEnd = (onConnectEnd) =>
  createAction(constants.SET_ON_CONNECT_END, {
    onConnectEnd,
  });
export const setElements = (elements) =>
  createAction(constants.SET_ELEMENTS, elements);
export const updateNodeDimensions = (updates) =>
  createAction(constants.UPDATE_NODE_DIMENSIONS, updates);
// export const updateNodePos = (payload) =>
//   createAction(constants.UPDATE_NODE_POS, payload);
export const updateNodePosDiff = (payload) =>
  createAction(constants.UPDATE_NODE_POS_DIFF, payload);
export const setUserSelection = (mousePos) =>
  createAction(constants.SET_USER_SELECTION, mousePos);
export const updateUserSelection = (mousePos) =>
  createAction(constants.UPDATE_USER_SELECTION, mousePos);
export const unsetUserSelection = () =>
  createAction(constants.UNSET_USER_SELECTION);
export const setSelection = (selectionActive) =>
  createAction(constants.SET_SELECTION, {
    selectionActive,
  });
export const unsetNodesSelection = () =>
  createAction(constants.UNSET_NODES_SELECTION, {
    nodesSelectionActive: false,
  });
// export const resetSelectedElements = () =>
//   createAction(constants.RESET_SELECTED_ELEMENTS, {
//     selectedElements: null,
//   });
// export const setSelectedElements = (elements) =>
// createAction(constants.SET_SELECTED_ELEMENTS, elements);
export const addSelectedElements = (elements) =>
  createAction(constants.ADD_SELECTED_ELEMENTS, elements);
export const updateTransform = (transform) =>
  createAction(constants.UPDATE_TRANSFORM, { transform });
export const updateSize = (size) =>
  createAction(constants.UPDATE_SIZE, {
    width: size.width || 500,
    height: size.height || 500,
  });
export const initD3Zoom = (payload) =>
  createAction(constants.INIT_D3ZOOM, payload);
export const setMinZoom = (minZoom) =>
  createAction(constants.SET_MINZOOM, minZoom);
export const setMaxZoom = (maxZoom) =>
  createAction(constants.SET_MAXZOOM, maxZoom);
export const setTranslateExtent = (translateExtent) =>
  createAction(constants.SET_TRANSLATEEXTENT, translateExtent);
export const setConnectionPosition = (connectionPosition) =>
  createAction(constants.SET_CONNECTION_POSITION, { connectionPosition });
export const setConnectionNodeId = (payload) =>
  createAction(constants.SET_CONNECTION_NODEID, payload);
export const setSnapToGrid = (snapToGrid) =>
  createAction(constants.SET_SNAPTOGRID, { snapToGrid });
export const setSnapGrid = (snapGrid) =>
  createAction(constants.SET_SNAPGRID, { snapGrid });
export const setInteractive = (isInteractive) =>
  createAction(constants.SET_INTERACTIVE, {
    nodesDraggable: isInteractive,
    nodesConnectable: isInteractive,
    elementsSelectable: isInteractive,
  });
export const setNodesDraggable = (nodesDraggable) =>
  createAction(constants.SET_NODES_DRAGGABLE, { nodesDraggable });
export const setNodesConnectable = (nodesConnectable) =>
  createAction(constants.SET_NODES_CONNECTABLE, { nodesConnectable });
export const setElementsSelectable = (elementsSelectable) =>
  createAction(constants.SET_ELEMENTS_SELECTABLE, { elementsSelectable });
export const setMultiSelectionActive = (multiSelectionActive) =>
  createAction(constants.SET_MULTI_SELECTION_ACTIVE, { multiSelectionActive });
export const setConnectionMode = (connectionMode) =>
  createAction(constants.SET_CONNECTION_MODE, { connectionMode });
export const setNodeExtent = (nodeExtent) =>
  createAction(constants.SET_NODE_EXTENT, nodeExtent);
