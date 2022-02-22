import React, { memo, useCallback, forwardRef } from "react";
import cc from "classcat";
import { useStoreActions, useStoreState } from "../store/hooks";
import { Position } from "../types";
import { onMouseDown } from "./Handle/handler";
import { styled } from "editor/style";
import { useNode } from "./Nodes/wrapNode";
const alwaysValid = () => true;

export const Handle = memo(
  forwardRef(function Handle(
    {
      type = "source",
      position = Position.Top,
      isValidConnection = alwaysValid,
      isConnectable = false,
      id,
      onConnect,
      children,
      className,
      ...rest
    },
    ref
  ) {
    const { id: nodeId } = useNode();
    const setPosition = useStoreActions(
      (actions) => actions.setConnectionPosition
    );
    const setConnectionNodeId = useStoreActions(
      (actions) => actions.setConnectionNodeId
    );
    const onConnectAction = useStoreState((state) => state.onConnect);
    const onConnectStart = useStoreState((state) => state.onConnectStart);
    const onConnectStop = useStoreState((state) => state.onConnectStop);
    const onConnectEnd = useStoreState((state) => state.onConnectEnd);
    const connectionMode = useStoreState((state) => state.connectionMode);
    const handleId = id || null;
    const isTarget = type === "target";
    const onConnectExtended = useCallback(
      (params) => {
        onConnectAction?.(params);
        onConnect?.(params);
      },
      [onConnectAction, onConnect]
    );
    const onMouseDownHandler = useCallback(
      (event) => {
        onMouseDown(
          event,
          handleId,
          nodeId,
          setConnectionNodeId,
          setPosition,
          onConnectExtended,
          isTarget,
          isValidConnection,
          connectionMode,
          undefined,
          undefined,
          onConnectStart,
          onConnectStop,
          onConnectEnd
        );
      },
      [
        handleId,
        nodeId,
        setConnectionNodeId,
        setPosition,
        onConnectExtended,
        isTarget,
        isValidConnection,
        connectionMode,
        onConnectStart,
        onConnectStop,
        onConnectEnd,
      ]
    );
    const handleClasses = cc([
      "nodrag",
      // className,
      {
        source: !isTarget,
        target: isTarget,
      },
    ]);

    return (
      <HandleCore
        data-handleid={handleId}
        data-nodeid={nodeId}
        data-handlepos={position}
        data-handletype={type}
        isConnectable={isConnectable}
        className={
          // TODO: Dont use classes for targeting handles, use data
          // attributes instead
          handleClasses
        }
        position={position}
        onMouseDown={onMouseDownHandler}
        ref={ref}
        {...rest}
      >
        {children}
      </HandleCore>
    );
  })
);

const HandleCore = styled("div", {
  pointerEvents: "none",
  position: "absolute",
  width: "10px",
  height: "10px",

  variants: {
    position: {
      bottom: {
        top: "auto",
        left: "50%",
        bottom: "-4px",
        transform: "translate(-50%, 0)",
      },

      top: {
        left: "50%",
        top: "-4px",
        transform: "translate(-50%, 0)",
      },

      left: {
        top: "50%",
        left: "0px",
        transform: "translate(-10px, -50%)",
      },

      right: {
        right: "0px",
        top: "50%",
        transform: "translate(0, -50%)",
      },
    },
    isConnectable: {
      true: {
        pointerEvents: "all",
        cursor: "crosshair",
        background: "$slate9",
        border: "1px solid $slate9",
        borderRadius: "100%",
      },
    },
  },
});
