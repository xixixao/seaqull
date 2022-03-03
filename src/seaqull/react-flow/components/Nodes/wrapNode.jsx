import cc from "classcat";
import * as Edge from "graph/Edge";
import * as Edges from "graph/Edges";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { first, only } from "js/Arrays";
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { DraggableCore } from "react-draggable";
import * as Layout from "../../../Layout";
import { useSetAppStateContext } from "../../../state";
import { useStore, useStoreActions, useStoreState } from "../../store/hooks";
import {
  useAddSelectedElements,
  useUpdateNodeDimensions,
} from "../../store/reducer";
import * as History from "seaqull/History";
import { hasTargetHandle } from "../Handle/handler";
import { doNodesOverlap } from "../../utils/graph";
import { Box } from "ui/layout/Box";

export default function wrapNode(NodeComponent) {
  const MemoizedNodeComponent = memo(NodeComponent);
  const NodeWrapper = ({
    id,
    type,
    data,
    scale,
    xPos,
    yPos,
    selected,
    onlySelected,
    wasOnlySelected,
    isAnySelected,
    highlight,
    onClick,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onContextMenu,
    onNodeDoubleClick,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    style,
    className,
    edited,
    isSelectable,
    isConnectable,
    selectNodesOnDrag,
    sourcePosition,
    targetPosition,
    isHidden,
    isInitialized,
    snapToGrid,
    snapGrid,
    isDragging,
    resizeObserver,
    dragHandle,
  }) => {
    const setAppState = useSetAppStateContext();
    const updateNodeDimensions = useUpdateNodeDimensions();
    const addSelectedElements = useAddSelectedElements();
    const connectionNodeId = useStoreState((state) => state.connectionNodeId);
    const connectionHandleId = useStoreState(
      (state) => state.connectionHandleId
    );
    const store = useStore();
    const nodeElement = useRef(null);
    const node = useMemo(
      () => ({ id, type, position: { x: xPos, y: yPos }, data }),
      [id, type, xPos, yPos, data]
    );
    const grid = useMemo(
      () => (snapToGrid ? snapGrid : [1, 1]),
      [snapToGrid, snapGrid]
    );
    const nodeStyle = useMemo(
      () => ({
        zIndex: selected ? 10 : 3,
        transform: `translate(${xPos}px,${yPos}px)`,
        pointerEvents:
          isSelectable || onClick || onMouseEnter || onMouseMove || onMouseLeave
            ? "all"
            : "none",
        // prevents jumping of nodes on start
        opacity: isInitialized ? 1 : 0,
        ...style,
      }),
      [
        selected,
        xPos,
        yPos,
        isSelectable,
        onClick,
        isInitialized,
        style,
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
      ]
    );
    const onMouseEnterHandler = useMemo(() => {
      if (!onMouseEnter || isDragging) {
        return;
      }
      return (event) => onMouseEnter(event, node);
    }, [onMouseEnter, isDragging, node]);
    const onMouseMoveHandler = useMemo(() => {
      if (!onMouseMove || isDragging) {
        return;
      }
      return (event) => onMouseMove(event, node);
    }, [onMouseMove, isDragging, node]);
    const onMouseLeaveHandler = useMemo(() => {
      if (!onMouseLeave || isDragging) {
        return;
      }
      return (event) => onMouseLeave(event, node);
    }, [onMouseLeave, isDragging, node]);
    const onContextMenuHandler = useMemo(() => {
      if (!onContextMenu) {
        return;
      }
      return (event) => onContextMenu(event, node);
    }, [onContextMenu, node]);
    const onDragStart = useCallback(
      (event) => {
        onNodeDragStart?.(event, node);
        if (selectNodesOnDrag && isSelectable) {
          if (!selected) {
            // TODO: Remove multiSelectionActive from state and use event
            // props directly
            addSelectedElements([node], event.metaKey);
          }
        } else if (!selectNodesOnDrag && !selected && isSelectable) {
          addSelectedElements([]);
        }
      },
      [
        onNodeDragStart,
        node,
        selectNodesOnDrag,
        isSelectable,
        selected,
        addSelectedElements,
      ]
    );
    const onDrag = useCallback(
      (event, draggableData) => {
        const { deltaX, deltaY } = draggableData;
        setAppState((appState) => {
          Nodes.selected(appState).forEach((node) => {
            Nodes.positionOf(appState, node).isDragging = true;
          });

          appState.highlightedNodeIDs = new Set();
          History.startOrContinueRecording(appState);

          const tightGroups = Nodes.groupBy(Nodes.selected(appState), (node) =>
            Nodes.tightRoot(appState, node)
          ).map((nodes) => Nodes.sortTight(appState, nodes));
          const onlyDraggedGroup = only(tightGroups);
          const firstDraggedNode =
            onlyDraggedGroup != null ? first(onlyDraggedGroup) : null;
          const isDetachMode =
            event.altKey ||
            (firstDraggedNode != null &&
              !Nodes.hasParents(appState, firstDraggedNode) &&
              hasTargetHandle(firstDraggedNode, event));

          if (!isDetachMode) {
            const draggedNodeRoots = Nodes.dedupe(
              Nodes.selected(appState).map((node) =>
                Nodes.tightRoot(appState, node)
              )
            );
            draggedNodeRoots.forEach((node) => {
              Node.moveBy(appState, node, deltaX, deltaY);
              Layout.layoutTightStack(appState, node);
            });
            History.endRecording(appState);
            return;
          }

          tightGroups.forEach((nodes) => {
            const firstNode = first(nodes);
            const parentEdge = Edges.tightParent(appState, firstNode);
            if (parentEdge != null) {
              const parent = Edges.parentNode(appState, parentEdge);
              Edge.detach(parentEdge);

              const lastNode = Arrays.last(nodes);
              Nodes.moveTightChild(appState, lastNode, parent);
              Layout.layoutTightStack(appState, parent);
            }

            Node.moveBy(appState, firstNode, deltaX, deltaY);
            Layout.layoutTightStack(appState, firstNode);
          });
          const validPotentialTightParent =
            firstDraggedNode != null
              ? only(overlappingLeafs(appState, firstDraggedNode, event))
              : null;
          appState.highlightedNodeIDs = Nodes.idSet(
            validPotentialTightParent != null ? [validPotentialTightParent] : []
          );
          History.endRecording(appState);
        });

        // if (onNodeDrag) {
        //   // node.position.x += draggableData.deltaX;
        //   // node.position.y += draggableData.deltaY;
        //   if (onNodeDrag(event, node, draggableData) === false) {
        //     return;
        //   }
        // }
        // updateNodePosDiff({
        //   id,
        //   diff: {
        //     x: draggableData.deltaX,
        //     y: draggableData.deltaY,
        //   },
        //   isDragging: true,
        // });
      },
      [setAppState]
    );

    const onDragStop = useCallback(
      (event) => {
        // onDragStop also gets called when user just clicks on a node.
        // Because of that we set dragging to true inside the onDrag handler and handle the click here

        // TODO: Dead code because we have "select on drag" and no onClick
        // if (!isDragging) {
        //   if (isSelectable && !selectNodesOnDrag && !selected) {
        //     addSelectedElements([node]);
        //   }
        //   onClick?.(event, node);
        //   return;
        // }
        setAppState((appState) => {
          Nodes.selected(appState).forEach((node) => {
            Nodes.positionOf(appState, node).isDragging = false;
          });
          appState.highlightedNodeIDs = new Set();

          const tightGroups = Nodes.groupBy(Nodes.selected(appState), (node) =>
            Nodes.tightRoot(appState, node)
          ).map((nodes) => Nodes.sortTight(appState, nodes));
          const onlyDraggedGroup = only(tightGroups);
          if (onlyDraggedGroup == null) {
            return;
          }
          const firstDraggedNode = first(onlyDraggedGroup);
          const isDetachMode =
            event.altKey ||
            (!Nodes.hasParents(appState, firstDraggedNode) &&
              hasTargetHandle(firstDraggedNode, event));
          if (!isDetachMode) {
            return;
          }
          const validPotentialTightParent = only(
            overlappingLeafs(appState, firstDraggedNode, event)
          );
          if (validPotentialTightParent == null) {
            return;
          }
          History.startRecording(appState);
          const firstNode = first(onlyDraggedGroup);
          Edges.removeAll(appState, Edges.parents(appState, firstNode));
          Edges.addTightChild(appState, validPotentialTightParent, firstNode);
          Layout.layoutTightStack(appState, validPotentialTightParent);
          History.endRecording(appState);
        });

        // updateNodePosDiff({
        //   id: node.id,
        //   isDragging: false,
        // });

        // onNodeDragStop?.(event, node);
      },
      [
        setAppState,
        //   node,
        //   isSelectable,
        //   selectNodesOnDrag,
        //   onClick,
        //   onNodeDragStop,
        //   isDragging,
        //   selected,
      ]
    );
    const onNodeDoubleClickHandler = useCallback(
      (event) => {
        onNodeDoubleClick?.(event, node);
        event.stopPropagation();
      },
      [node, onNodeDoubleClick]
    );
    const selectNode = useCallback(() => {
      const multiSelectionActive = store.getState().multiSelectionActive;
      if (!selected && !multiSelectionActive) {
        addSelectedElements([node]);
      }
    }, [addSelectedElements, node, selected, store]);
    const setNodeRef = useCallback(
      (current) => {
        nodeElement.current?.removeEventListener("focus", selectNode);
        current?.addEventListener("focus", selectNode);
        nodeElement.current = current;
      },
      [selectNode]
    );
    useEffect(() => {
      if (onlySelected) {
        nodeElement.current?.focus();
      }
    }, [onlySelected]);
    useLayoutEffect(() => {
      if (nodeElement.current && !isHidden) {
        updateNodeDimensions([
          { id, nodeElement: nodeElement.current, forceUpdate: true },
        ]);
      }
    }, [id, isHidden, sourcePosition, targetPosition, updateNodeDimensions]);
    useEffect(() => {
      if (nodeElement.current) {
        const currNode = nodeElement.current;
        resizeObserver?.observe(currNode);
        return () => resizeObserver?.unobserve(currNode);
      }
    }, [resizeObserver]);
    const nodeData = useMemo(
      () => ({
        id,
        data,
        type,
      }),
      [data, id, type]
    );
    if (isHidden) {
      return null;
    }
    const nodeClasses = cc([
      "react-flow__node",
      // TODO: Dont use classes, use React props instead
      {
        selected,
        selectable: isSelectable,
      },
    ]);
    const nodeUIData = {
      id,
      data,
      type,
      xPos,
      yPos,
      selected,
      wasOnlySelected,
      isAnySelected,
      highlight,
      isConnectable,
      sourcePosition,
      targetPosition,
      isDragging,
      edited,
      dragHandle,
      nodeElement,
      connectingHandleID:
        connectionNodeId === id ? connectionHandleId ?? "0" : null,
    };
    return (
      <DraggableCore
        onStart={onDragStart}
        onDrag={onDrag}
        onStop={onDragStop}
        scale={scale}
        cancel=".nodrag"
        nodeRef={nodeElement}
        grid={grid}
        enableUserSelectHack={false}
        handle={dragHandle}
      >
        <Box
          css={{
            position: "absolute",
            userSelect: "none",
            pointerEvents: "all",
            transformOrigin: "0 0",
            outline: "none",
            cursor: "grab",
          }}
          className={nodeClasses}
          ref={setNodeRef}
          style={nodeStyle}
          onMouseEnter={onMouseEnterHandler}
          onMouseMove={onMouseMoveHandler}
          onMouseLeave={onMouseLeaveHandler}
          onContextMenu={onContextMenuHandler}
          onDoubleClick={onNodeDoubleClickHandler}
          data-id={id}
          tabIndex={0}
        >
          <NodeUIContext.Provider value={nodeUIData}>
            <NodeContext.Provider value={nodeData}>
              <MemoizedNodeComponent />
            </NodeContext.Provider>
          </NodeUIContext.Provider>
        </Box>
      </DraggableCore>
    );
  };
  NodeWrapper.displayName = "NodeWrapper";
  return memo(NodeWrapper);
}

const NodeUIContext = createContext();
const NodeContext = createContext();

export function useNodeUIProps() {
  return useContext(NodeUIContext);
}

export function useNode() {
  return useContext(NodeContext);
}

function overlappingLeafs(graph, targetNode, event) {
  if (!hasTargetHandle(targetNode, event)) {
    return false;
  }
  const targetPosition = Nodes.positionOf(graph, targetNode);
  return Nodes.tightLeafs(graph).filter((node) => {
    const position = Nodes.positionOf(graph, node);
    return (
      !Node.is(targetNode, node) &&
      doNodesOverlap(position, targetPosition, 20) &&
      !Edges.isAncestor(graph, targetNode, node)
    );
  });
}
