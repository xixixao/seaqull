import { AllSidesIcon, ZoomInIcon, ZoomOutIcon } from "@modulz/radix-icons";
import React, { useCallback, useEffect, useState } from "react";
import useZoomPanHelper from "../../react-flow/hooks/useZoomPanHelper";
import { Column } from "./Column";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";

export function PaneControls({
  fitViewParams,
  onZoomIn,
  onZoomOut,
  onFitView,
  onInteractiveChange,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { zoomIn, zoomOut, fitView } = useZoomPanHelper();
  const onZoomInHandler = useCallback(() => {
    zoomIn?.();
    onZoomIn?.();
  }, [zoomIn, onZoomIn]);
  const onZoomOutHandler = useCallback(() => {
    zoomOut?.();
    onZoomOut?.();
  }, [zoomOut, onZoomOut]);
  const onFitViewHandler = useCallback(() => {
    fitView?.(fitViewParams);
    onFitView?.();
  }, [fitView, fitViewParams, onFitView]);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  if (!isVisible) {
    return null;
  }
  return (
    <Column
      css={{
        position: "absolute",
        zIndex: 5,
        bottom: 10,
        left: 10,
      }}
    >
      <Tooltip content="Zoom in" side="right" align="center">
        <IconButton onClick={onZoomInHandler}>
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Zoom out" side="right" align="center">
        <IconButton onClick={onZoomOutHandler}>
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Fit view" side="right" align="center">
        <IconButton onClick={onFitViewHandler}>
          <AllSidesIcon />
        </IconButton>
      </Tooltip>
    </Column>
  );
}
