import cc from "classcat";
import { current } from "immer";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { DraggableCore } from "react-draggable";
import * as Arrays from "../../../Arrays";
import { first, only } from "../../../Arrays";
import * as Edge from "../../../Edge";
import * as Edges from "../../../Edges";
import * as Node from "../../../Node";
import * as Nodes from "../../../Nodes";
import { useSetAppStateContext } from "../../../state";
import { useStoreActions, useStoreState } from "../../store/hooks";
import {
  useAddSelectedElements,
  useUpdateNodeDimensions,
} from "../../store/reducer";

export default function wrapNode(NodeComponent) {
  const NodeWrapper = ({
    id,
    type,
    data,
    scale,
    xPos,
    yPos,
    selected,
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
    isDraggable,
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
    const updateNodePosDiff = useStoreActions(
      (actions) => actions.updateNodePosDiff
    );
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
          isSelectable ||
          isDraggable ||
          onClick ||
          onMouseEnter ||
          onMouseMove ||
          onMouseLeave
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
        isDraggable,
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
    const onSelectNodeHandler = useCallback(
      (event) => {
        if (!isDraggable) {
          if (isSelectable) {
            unsetNodesSelection();
            if (!selected) {
              // TODO: Move multiSelectionActive to context
              addSelectedElements([node], multiSelectionActive);
            }
          }
          onClick?.(event, node);
        }
      },
      [isSelectable, selected, isDraggable, onClick, node, addSelectedElements]
    );
    const onDragStart = useCallback(
      (event) => {
        onNodeDragStart?.(event, node);
        if (selectNodesOnDrag && isSelectable) {
          unsetNodesSelection();
          if (!selected) {
            // TODO: Move multiSelectionActive to context
            addSelectedElements([node], multiSelectionActive);
          }
        } else if (!selectNodesOnDrag && !selected && isSelectable) {
          unsetNodesSelection();
          addSelectedElements([]);
        }
      },
      [
        node,
        selected,
        selectNodesOnDrag,
        isSelectable,
        onNodeDragStart,
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
            draggedNodeRoots.forEach((node) => {
              Node.moveBy(appState, node, deltaX, deltaY);
              Nodes.layout(appState, node);
            });
            return;
          }

          const tightGroups = Nodes.groupBy(Nodes.selected(appState), (node) =>
            Nodes.tightRoot(appState, node)
          ).map((nodes) => Nodes.sortTight(appState, nodes));
          tightGroups.forEach((nodes) => {
            const firstNode = first(nodes);
            const parentEdge = Edges.tightParent(appState, firstNode);
            if (parentEdge != null) {
              const parent = Edges.parentNode(appState, parentEdge);

              const lastNode = Arrays.last(nodes);
              const children = Nodes.tightChildren(appState, lastNode);
              Edge.detach(parentEdge);
              Edges.removeAll(
                appState,
                Edges.tightChildren(appState, lastNode)
              );
              Edges.addTightChildren(appState, parent, children);
              Nodes.layout(appState, parent);
            }

            Node.moveBy(appState, firstNode, deltaX, deltaY);
            Nodes.layout(appState, firstNode);
          });
          const onlyDraggedGroup = only(tightGroups);
          const validPotentialTightParent =
            onlyDraggedGroup != null
              ? only(Nodes.overlappingLeafs(appState, first(onlyDraggedGroup)))
              : null;
          appState.highlightedNodeIDs = Nodes.idSet(
            validPotentialTightParent != null ? [validPotentialTightParent] : []
          );
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
            Nodes.overlappingLeafs(appState, first(onlyDraggedGroup))
          );
          if (validPotentialTightParent == null) {
            return;
          }
          const firstNode = first(onlyDraggedGroup);
          Edges.removeAll(appState, Edges.parents(appState, firstNode));
          Edges.addTightChild(appState, validPotentialTightParent, firstNode);
          Nodes.layout(appState, validPotentialTightParent);
        });

        // updateNodePosDiff({
        //   id: node.id,
        //   isDragging: false,
        // });

        // onNodeDragStop?.(event, node);
      },
      [
        id,
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
      },
      [node, onNodeDoubleClick]
    );
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
    return (
      <DraggableCore
        onStart={onDragStart}
        onDrag={onDrag}
        onStop={onDragStop}
        scale={scale}
        disabled={!isDraggable}
        cancel=".nodrag"
        nodeRef={nodeElement}
        grid={grid}
        enableUserSelectHack={false}
        handle={dragHandle}
      >
        <div
          className={nodeClasses}
          ref={nodeElement}
          style={nodeStyle}
          onMouseEnter={onMouseEnterHandler}
          onMouseMove={onMouseMoveHandler}
          onMouseLeave={onMouseLeaveHandler}
          onContextMenu={onContextMenuHandler}
          onClick={onSelectNodeHandler}
          onDoubleClick={onNodeDoubleClickHandler}
          data-id={id}
        >
          <NodeComponent
            id={id}
            data={data}
            type={type}
            xPos={xPos}
            yPos={yPos}
            selected={selected}
            highlight={highlight}
            isConnectable={isConnectable}
            sourcePosition={sourcePosition}
            targetPosition={targetPosition}
            isDragging={isDragging}
            dragHandle={dragHandle}
          />
        </div>
      </DraggableCore>
    );
  };
  NodeWrapper.displayName = "NodeWrapper";
  return memo(NodeWrapper);
}
