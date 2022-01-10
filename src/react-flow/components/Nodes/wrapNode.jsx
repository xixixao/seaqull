import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  memo,
  useMemo,
  useCallback,
} from "react";
import { DraggableCore } from "react-draggable";
import cc from "classcat";
import { useStoreActions } from "../../store/hooks";
export default function wrapNode(NodeComponent) {
  const NodeWrapper = ({
    id,
    type,
    data,
    scale,
    xPos,
    yPos,
    selected,
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
    const updateNodeDimensions = useStoreActions(
      (actions) => actions.updateNodeDimensions
    );
    const addSelectedElements = useStoreActions(
      (actions) => actions.addSelectedElements
    );
    const updateNodePosDiff = useStoreActions(
      (actions) => actions.updateNodePosDiff
    );
    const unsetNodesSelection = useStoreActions(
      (actions) => actions.unsetNodesSelection
    );
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
              addSelectedElements(node);
            }
          }
          onClick?.(event, node);
        }
      },
      [isSelectable, selected, isDraggable, onClick, node]
    );
    const onDragStart = useCallback(
      (event) => {
        onNodeDragStart?.(event, node);
        if (selectNodesOnDrag && isSelectable) {
          unsetNodesSelection();
          if (!selected) {
            addSelectedElements(node);
          }
        } else if (!selectNodesOnDrag && !selected && isSelectable) {
          unsetNodesSelection();
          addSelectedElements([]);
        }
      },
      [node, selected, selectNodesOnDrag, isSelectable, onNodeDragStart]
    );
    const onDrag = useCallback(
      (event, draggableData) => {
        if (onNodeDrag) {
          node.position.x += draggableData.deltaX;
          node.position.y += draggableData.deltaY;
          if (onNodeDrag(event, node, draggableData) === false) {
            return;
          }
        }
        updateNodePosDiff({
          id,
          diff: {
            x: draggableData.deltaX,
            y: draggableData.deltaY,
          },
          isDragging: true,
        });
      },
      [id, node, onNodeDrag]
    );
    const onDragStop = useCallback(
      (event) => {
        // onDragStop also gets called when user just clicks on a node.
        // Because of that we set dragging to true inside the onDrag handler and handle the click here
        if (!isDragging) {
          if (isSelectable && !selectNodesOnDrag && !selected) {
            addSelectedElements(node);
          }
          onClick?.(event, node);
          return;
        }
        updateNodePosDiff({
          id: node.id,
          isDragging: false,
        });
        onNodeDragStop?.(event, node);
      },
      [
        node,
        isSelectable,
        selectNodesOnDrag,
        onClick,
        onNodeDragStop,
        isDragging,
        selected,
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
    }, [id, isHidden, sourcePosition, targetPosition]);
    useEffect(() => {
      if (nodeElement.current) {
        const currNode = nodeElement.current;
        resizeObserver?.observe(currNode);
        return () => resizeObserver?.unobserve(currNode);
      }
    }, []);
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
