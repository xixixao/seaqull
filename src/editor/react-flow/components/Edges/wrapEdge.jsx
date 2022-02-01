import React, { memo, useCallback, useState, useMemo } from "react";
import cc from "classcat";
import { useStoreActions, useStoreState } from "../../store/hooks";
import { onMouseDown } from "../Handle/handler";
import { EdgeAnchor } from "./EdgeAnchor";

export default function wrapEdge(EdgeComponent) {
  const EdgeWrapper = ({
    id,
    className,
    type,
    data,
    onClick,
    onEdgeDoubleClick,
    selected,
    animated,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    style,
    arrowHeadType,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    elementsSelectable,
    markerEndId,
    isHidden,
    sourceHandleId,
    targetHandleId,
    handleEdgeUpdate,
    onConnectEdge,
    onContextMenu,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    edgeUpdaterRadius,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
  }) => {
    const addSelectedElements = useStoreActions(
      (actions) => actions.addSelectedElements
    );
    const setConnectionNodeId = useStoreActions(
      (actions) => actions.setConnectionNodeId
    );
    const unsetNodesSelection = useStoreActions(
      (actions) => actions.unsetNodesSelection
    );
    const setPosition = useStoreActions(
      (actions) => actions.setConnectionPosition
    );
    const connectionMode = useStoreState((state) => state.connectionMode);
    const [updating, setUpdating] = useState(false);
    const inactive = !elementsSelectable && !onClick;
    const edgeClasses = cc([
      "react-flow__edge",
      `react-flow__edge-${type}`,
      className,
      { selected, animated, inactive, updating },
    ]);
    const edgeElement = useMemo(() => {
      const el = {
        id,
        source,
        target,
        type,
      };
      if (sourceHandleId) {
        el.sourceHandle = sourceHandleId;
      }
      if (targetHandleId) {
        el.targetHandle = targetHandleId;
      }
      if (typeof data !== "undefined") {
        el.data = data;
      }
      return el;
    }, [id, source, target, type, sourceHandleId, targetHandleId, data]);
    const onEdgeClick = useCallback(
      (event) => {
        // TODO: This is for supporting edge selection
        // if (elementsSelectable) {
        //   unsetNodesSelection();
        //   addSelectedElements(edgeElement);
        // }
        onClick?.(event, edgeElement);
      },
      [elementsSelectable, edgeElement, onClick]
    );
    const onEdgeDoubleClickHandler = useCallback(
      (event) => {
        onEdgeDoubleClick?.(event, edgeElement);
      },
      [edgeElement, onEdgeDoubleClick]
    );
    const onEdgeContextMenu = useCallback(
      (event) => {
        onContextMenu?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );
    const onEdgeMouseEnter = useCallback(
      (event) => {
        onMouseEnter?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );
    const onEdgeMouseMove = useCallback(
      (event) => {
        onMouseMove?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );
    const onEdgeMouseLeave = useCallback(
      (event) => {
        onMouseLeave?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );
    const handleEdgeUpdater = useCallback(
      (event, isSourceHandle) => {
        const nodeId = isSourceHandle ? target : source;
        const handleId = isSourceHandle ? targetHandleId : sourceHandleId;
        const isValidConnection = () => true;
        const isTarget = isSourceHandle;
        onEdgeUpdateStart?.(event, edgeElement);
        const _onEdgeUpdate = onEdgeUpdateEnd
          ? (evt) => onEdgeUpdateEnd(evt, edgeElement)
          : undefined;
        onMouseDown(
          event,
          handleId,
          nodeId,
          setConnectionNodeId,
          setPosition,
          onConnectEdge,
          isTarget,
          isValidConnection,
          connectionMode,
          isSourceHandle ? "target" : "source",
          _onEdgeUpdate
        );
      },
      [
        id,
        source,
        target,
        type,
        sourceHandleId,
        targetHandleId,
        setConnectionNodeId,
        setPosition,
        edgeElement,
        onConnectEdge,
      ]
    );
    const onEdgeUpdaterSourceMouseDown = useCallback(
      (event) => {
        handleEdgeUpdater(event, true);
      },
      [id, source, sourceHandleId, handleEdgeUpdater]
    );
    const onEdgeUpdaterTargetMouseDown = useCallback(
      (event) => {
        handleEdgeUpdater(event, false);
      },
      [id, target, targetHandleId, handleEdgeUpdater]
    );
    const onEdgeUpdaterMouseEnter = useCallback(
      () => setUpdating(true),
      [setUpdating]
    );
    const onEdgeUpdaterMouseOut = useCallback(
      () => setUpdating(false),
      [setUpdating]
    );
    if (isHidden) {
      return null;
    }
    return (
      <g
        className={edgeClasses}
        onClick={onEdgeClick}
        onDoubleClick={onEdgeDoubleClickHandler}
        onContextMenu={onEdgeContextMenu}
        onMouseEnter={onEdgeMouseEnter}
        onMouseMove={onEdgeMouseMove}
        onMouseLeave={onEdgeMouseLeave}
      >
        <EdgeComponent
          id={id}
          source={source}
          target={target}
          selected={selected}
          animated={animated}
          label={label}
          labelStyle={labelStyle}
          labelShowBg={labelShowBg}
          labelBgStyle={labelBgStyle}
          labelBgPadding={labelBgPadding}
          labelBgBorderRadius={labelBgBorderRadius}
          data={data}
          style={style}
          arrowHeadType={arrowHeadType}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          sourcePosition={sourcePosition}
          targetPosition={targetPosition}
          markerEndId={markerEndId}
          sourceHandleId={sourceHandleId}
          targetHandleId={targetHandleId}
        />
        {handleEdgeUpdate && (
          <g
            onMouseDown={onEdgeUpdaterSourceMouseDown}
            onMouseEnter={onEdgeUpdaterMouseEnter}
            onMouseOut={onEdgeUpdaterMouseOut}
          >
            <EdgeAnchor
              position={sourcePosition}
              centerX={sourceX}
              centerY={sourceY}
              radius={edgeUpdaterRadius}
            />
          </g>
        )}
        {handleEdgeUpdate && (
          <g
            onMouseDown={onEdgeUpdaterTargetMouseDown}
            onMouseEnter={onEdgeUpdaterMouseEnter}
            onMouseOut={onEdgeUpdaterMouseOut}
          >
            <EdgeAnchor
              position={targetPosition}
              centerX={targetX}
              centerY={targetY}
              radius={edgeUpdaterRadius}
            />
          </g>
        )}
      </g>
    );
  };
  EdgeWrapper.displayName = "EdgeWrapper";
  return memo(EdgeWrapper);
}
