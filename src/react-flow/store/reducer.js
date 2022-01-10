import isEqual from "fast-deep-equal";
import { clampPosition, getDimensions } from "../utils";
import {
  getNodesInside,
  getConnectedEdges,
  getRectOfNodes,
  isNode,
  isEdge,
  parseNode,
  parseEdge,
} from "../utils/graph";
import { getHandleBounds } from "../components/Nodes/utils";
import * as constants from "./contants";
import { initialState } from "./index";
import { useSetAppStateContext } from "../../state";

import * as Nodes from "../../Nodes";

export function useUpdateNodeDimensions() {
  const setAppState = useSetAppStateContext();
  return (updates) =>
    setAppState((appState) => {
      updates.forEach(({ id, nodeElement, forceUpdate }) => {
        const position = Nodes.positionWithID(appState, id);
        const dimensions = getDimensions(nodeElement);
        const doUpdate =
          dimensions.width &&
          dimensions.height &&
          (position.width !== dimensions.width ||
            position.height !== dimensions.height ||
            forceUpdate);
        if (doUpdate) {
          const handleBounds = getHandleBounds(
            nodeElement,
            1 // TODO: state.transform[2]
          );
          position.width = dimensions.width;
          position.height = dimensions.height;
          position.handleBounds = handleBounds;
        }
      });
    });
}

// Probably not needed
// export function useUpdateNodePosDiff(update) {
//   const setAppState = useSetAppStateContext();
//   setAppState((appState) => {
//     const { id, diff, isDragging } = update;
//     const shouldUpdate =
//       id === node.id ||
//       (id == null &&
//         state.selectedElements?.find((sNode) => sNode.id === node.id));
//     if (!shouldUpdate) {
//       return;
//     }
//     const position = Nodes.positionWithID(appState, id);
//     position.isDragging = isDragging;
//     if (diff) {
//       position.x += diff.x;
//       position.y += diff.y;
//     }
//   });
// }

export default function reactFlowReducer(state = initialState, action) {
  switch (action.type) {
    // case constants.SET_ELEMENTS: {
    //   const { elements: propElements, selectedNodeIDs } = action.payload;
    //   const nextElements = {
    //     nextNodes: [],
    //     nextEdges: [],
    //   };
    //   const { nextNodes, nextEdges } = propElements.reduce(
    //     (res, propElement) => {
    //       if (isNode(propElement)) {
    //         const storeNode = state.nodes.find(
    //           (node) => node.id === propElement.id
    //         );
    //         if (storeNode) {
    //           const updatedNode = {
    //             ...storeNode,
    //             ...propElement,
    //           };
    //           if (
    //             storeNode.position.x !== propElement.position.x ||
    //             storeNode.position.y !== propElement.position.y
    //           ) {
    //             updatedNode.__rf.position = propElement.position;
    //           }
    //           if (
    //             typeof propElement.type !== "undefined" &&
    //             propElement.type !== storeNode.type
    //           ) {
    //             // we reset the elements dimensions here in order to force a re-calculation of the bounds.
    //             // When the type of a node changes it is possible that the number or positions of handles changes too.
    //             updatedNode.__rf.width = null;
    //           }
    //           res.nextNodes.push(updatedNode);
    //         } else {
    //           res.nextNodes.push(parseNode(propElement, state.nodeExtent));
    //         }
    //       } else if (isEdge(propElement)) {
    //         const storeEdge = state.edges.find(
    //           (se) => se.id === propElement.id
    //         );
    //         if (storeEdge) {
    //           res.nextEdges.push({
    //             ...storeEdge,
    //             ...propElement,
    //           });
    //         } else {
    //           res.nextEdges.push(parseEdge(propElement));
    //         }
    //       }
    //       return res;
    //     },
    //     nextElements
    //   );
    //   let selectedElements = state.selectedElements;
    //   let i = 0;
    //   for (const id of selectedNodeIDs) {
    //     if ((state.selectedElements ?? [])[i]?.id !== id) {
    //       selectedElements = Array.from(selectedNodeIDs).map((id) => ({ id }));
    //       break;
    //     }
    //     i++;
    //   }
    //   return { ...state, selectedElements, nodes: nextNodes, edges: nextEdges };
    // }
    case constants.UPDATE_NODE_DIMENSIONS: {
      throw new Error("migrate to context");
    }
    case constants.UPDATE_NODE_POS: {
      throw new Error("migrate to context");
    }
    case constants.UPDATE_NODE_POS_DIFF: {
      throw new Error("migrate to context");
    }
    case constants.SET_USER_SELECTION: {
      const mousePos = action.payload;
      return {
        ...state,
        selectionActive: true,
        userSelectionRect: {
          width: 0,
          height: 0,
          startX: mousePos.x,
          startY: mousePos.y,
          x: mousePos.x,
          y: mousePos.y,
          draw: true,
        },
      };
    }
    case constants.UPDATE_USER_SELECTION: {
      const mousePos = action.payload;
      const startX = state.userSelectionRect.startX ?? 0;
      const startY = state.userSelectionRect.startY ?? 0;
      const nextUserSelectRect = {
        ...state.userSelectionRect,
        x: mousePos.x < startX ? mousePos.x : state.userSelectionRect.x,
        y: mousePos.y < startY ? mousePos.y : state.userSelectionRect.y,
        width: Math.abs(mousePos.x - startX),
        height: Math.abs(mousePos.y - startY),
      };
      const selectedNodes = getNodesInside(
        state.nodes,
        nextUserSelectRect,
        state.transform,
        false,
        true
      );
      const selectedEdges = getConnectedEdges(selectedNodes, state.edges);
      const nextSelectedElements = [...selectedNodes, ...selectedEdges];
      const selectedElementsChanged = !isEqual(
        nextSelectedElements,
        state.selectedElements
      );
      const selectedElementsUpdate = selectedElementsChanged
        ? {
            selectedElements:
              nextSelectedElements.length > 0 ? nextSelectedElements : null,
          }
        : {};
      return {
        ...state,
        ...selectedElementsUpdate,
        userSelectionRect: nextUserSelectRect,
      };
    }
    case constants.UNSET_USER_SELECTION: {
      // const selectedNodes = state.selectedElements?.filter(
      //   (node) => isNode(node) && node.__rf
      // );
      const stateUpdate = {
        ...state,
        selectionActive: false,
        userSelectionRect: {
          ...state.userSelectionRect,
          draw: false,
        },
      };
      stateUpdate.nodesSelectionActive = false;
      // if ((selectedNodes ?? []).length < 2) {
      //   // stateUpdate.selectedElements = null;
      // stateUpdate.nodesSelectionActive = false;
      // } else {
      //   const selectedNodesBbox = getRectOfNodes(selectedNodes);
      //   stateUpdate.selectedNodesBbox = selectedNodesBbox;
      //   stateUpdate.nodesSelectionActive = true;
      // }
      return stateUpdate;
    }
    case constants.SET_SELECTED_ELEMENTS: {
      const elements = action.payload;
      const selectedElementsArr = Array.isArray(elements)
        ? elements
        : [elements];
      const selectedElementsUpdated = !isEqual(
        selectedElementsArr,
        state.selectedElements
      );
      const selectedElements = selectedElementsUpdated
        ? selectedElementsArr
        : state.selectedElements;
      return {
        ...state,
        selectedElements,
      };
    }
    case constants.ADD_SELECTED_ELEMENTS: {
      const { multiSelectionActive, selectedElements } = state;
      const elements = action.payload;
      const selectedElementsArr = Array.isArray(elements)
        ? elements
        : [elements];
      let nextElements = selectedElementsArr;
      if (multiSelectionActive) {
        nextElements = selectedElements
          ? [...selectedElementsArr, ...selectedElements]
          : selectedElementsArr;
      }
      const selectedElementsUpdated = !isEqual(
        nextElements,
        state.selectedElements
      );
      const nextSelectedElements = selectedElementsUpdated
        ? nextElements
        : state.selectedElements;
      return { ...state, selectedElements: nextSelectedElements };
    }
    case constants.INIT_D3ZOOM: {
      const { d3Zoom, d3Selection, d3ZoomHandler, transform } = action.payload;
      return {
        ...state,
        d3Zoom,
        d3Selection,
        d3ZoomHandler,
        transform,
      };
    }
    case constants.SET_MINZOOM: {
      const minZoom = action.payload;
      state.d3Zoom?.scaleExtent([minZoom, state.maxZoom]);
      return {
        ...state,
        minZoom,
      };
    }
    case constants.SET_MAXZOOM: {
      const maxZoom = action.payload;
      state.d3Zoom?.scaleExtent([state.minZoom, maxZoom]);
      return {
        ...state,
        maxZoom,
      };
    }
    case constants.SET_TRANSLATEEXTENT: {
      const translateExtent = action.payload;
      state.d3Zoom?.translateExtent(translateExtent);
      return {
        ...state,
        translateExtent,
      };
    }
    case constants.SET_NODE_EXTENT: {
      const nodeExtent = action.payload;
      return {
        ...state,
        nodeExtent,
        nodes: state.nodes.map((node) => {
          return {
            ...node,
            __rf: {
              ...node.__rf,
              position: clampPosition(node.__rf.position, nodeExtent),
            },
          };
        }),
      };
    }
    case constants.SET_ON_CONNECT:
    case constants.SET_ON_CONNECT_START:
    case constants.SET_ON_CONNECT_STOP:
    case constants.SET_ON_CONNECT_END:
    case constants.RESET_SELECTED_ELEMENTS:
    case constants.UNSET_NODES_SELECTION:
    case constants.UPDATE_TRANSFORM:
    case constants.UPDATE_SIZE:
    case constants.SET_CONNECTION_POSITION:
    case constants.SET_CONNECTION_NODEID:
    case constants.SET_SNAPTOGRID:
    case constants.SET_SNAPGRID:
    case constants.SET_INTERACTIVE:
    case constants.SET_NODES_DRAGGABLE:
    case constants.SET_NODES_CONNECTABLE:
    case constants.SET_ELEMENTS_SELECTABLE:
    case constants.SET_MULTI_SELECTION_ACTIVE:
    case constants.SET_CONNECTION_MODE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
