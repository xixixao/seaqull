import { AllSidesIcon, ZoomInIcon, ZoomOutIcon } from "@modulz/radix-icons";
import React from "react";
import { useContext } from "react";
import { AppStateContext } from "seaqull/state";
import { Button } from "ui/interactive/Button";
import VerticalSpace from "ui/layout/VerticalSpace";
import { IconButton } from "../../../ui/interactive/IconButton";
import { Tooltip } from "../../../ui/interactive/Tooltip";
import useZoomPanHelper from "../hooks/useZoomPanHelper";
import { useStoreState } from "../store/hooks";

export function PaneControls({ tooltipProps }) {
  const { zoomIn, zoomOut, resetZoom } = useZoomPanHelper();
  return (
    <>
      <Tooltip content="Zoom in" {...tooltipProps}>
        <IconButton onClick={zoomIn}>
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Zoom out" {...tooltipProps}>
        <IconButton onClick={zoomOut}>
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
      <FitViewButton tooltipProps={tooltipProps} />
      <VerticalSpace />
      <VerticalSpace />
      <Tooltip content="Reset zoom" {...tooltipProps}>
        <Button ghost={true} onClick={resetZoom}>
          <ZoomIndicator />
        </Button>
      </Tooltip>
    </>
  );
}

function FitViewButton({ tooltipProps }) {
  const { fitView } = useZoomPanHelper();
  const positions = useContext(AppStateContext.positions);
  return (
    <Tooltip content="Fit view" {...tooltipProps}>
      <IconButton onClick={() => fitView(positions)}>
        <AllSidesIcon />
      </IconButton>
    </Tooltip>
  );
}

function ZoomIndicator() {
  const [, , zoom] = useStoreState((s) => s.transform);
  return Math.floor(zoom * 10) * 10 + "%";
}
