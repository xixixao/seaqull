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
import { useStoreActions, useStoreState } from "../../store/hooks";
import {
  useAddSelectedElements,
  useUpdateNodeDimensions,
} from "../../store/reducer";
import * as History from "editor/History";

export default function wrapNode(NodeComponent) {
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
    const unsetNodesSelection = useStoreActions(
      (actions) => actions.unsetNodesSelection
    );
    const multiSelectionActive = useStoreState((s) => s.multiSelectionActive);
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
          unsetNodesSelection();
          if (!selected) {
            // TODO: Remove multiSelectionActive from state and use event
            // props directly
            addSelectedElements([node], event.metaKey);
          }
        } else if (!selectNodesOnDrag && !selected && isSelectable) {
          unsetNodesSelection();
          addSelectedElements([]);
        }
      },
      [
        onNodeDragStart,
        node,
        selectNodesOnDrag,
        isSelectable,
        selected,
        unsetNodesSelection,
        addSelectedElements,
        multiSelectionActive,
      ]
    );
    const onDrag = useCallback(
      (event, draggableData) => {
        const { deltaX, deltaY } = draggableData;
        setAppState((appState) => {
          Nodes.selected(appState).forEach((node) => {
            Nodes.positionOf(appState, node).isDragging = true;
          });

          const isDetachMode = event.altKey;
          appState.highlightedNodeIDs = new Set();
          if (!isDetachMode) {
            const draggedNodeRoots = Nodes.dedupe(
              Nodes.selected(appState).map((node) =>
                Nodes.tightRoot(appState, node)
              )
            );
            History.startOrContinueRecording(appState);
            draggedNodeRoots.forEach((node) => {
              Node.moveBy(appState, node, deltaX, deltaY);
              Layout.layoutTightStack(appState, node);
            });
            History.endRecording(appState);
            return;
          }

          History.startOrContinueRecording(appState);
          const tightGroups = Nodes.groupBy(Nodes.selected(appState), (node) =>
            Nodes.tightRoot(appState, node)
          ).map((nodes) => Nodes.sortTight(appState, nodes));
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
          const onlyDraggedGroup = only(tightGroups);
          const validPotentialTightParent =
            onlyDraggedGroup != null
              ? only(
                  Nodes.overlappingLeafs(
                    appState,
                    first(onlyDraggedGroup),
                    event
                  )
                )
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

          const isDetachMode = event.altKey;
          if (!isDetachMode) {
            return;
          }
          const tightGroups = Nodes.groupBy(Nodes.selected(appState), (node) =>
            Nodes.tightRoot(appState, node)
          ).map((nodes) => Nodes.sortTight(appState, nodes));
          const onlyDraggedGroup = only(tightGroups);
          if (onlyDraggedGroup == null) {
            return;
          }
          const validPotentialTightParent = only(
            Nodes.overlappingLeafs(appState, first(onlyDraggedGroup), event)
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
      if (!selected && !multiSelectionActive) {
        addSelectedElements([node]);
      }
    }, [addSelectedElements, multiSelectionActive, node, selected]);
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
    if (isHidden) {
      return null;
    }
    const nodeClasses = cc([
      "react-flow__node",
      `react-flow__node-${type}`,
      className,
      {
        selected,
        selectable: isSelectable,
      },
    ]);
    const nodeInfo = {
      id,
      data,
      type,
      xPos,
      yPos,
      selected,
      wasOnlySelected,
      highlight,
      isConnectable,
      sourcePosition,
      targetPosition,
      isDragging,
      edited,
      dragHandle,
      nodeElement,
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
        <div
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
          <NodeContext.Provider value={nodeInfo}>
            <NodeComponent />
          </NodeContext.Provider>
        </div>
      </DraggableCore>
    );
  };
  NodeWrapper.displayName = "NodeWrapper";
  return memo(NodeWrapper);
}

const NodeContext = createContext();

export function useNode() {
  return useContext(NodeContext);
}
