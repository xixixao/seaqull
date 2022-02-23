import React, { memo, useCallback } from "react";
import { BoxSelection } from "../components/BoxSelection";
import useGlobalKeyHandler from "../hooks/useGlobalKeyHandler";
import useKeyPress from "../hooks/useKeyPress";
import { useResetSelectedElements } from "../store/reducer";
import { ZoomPane } from "./ZoomPane";

export const FlowRenderer = memo(function ({
  children,
  onPaneClick,
  onPaneDoubleClick,
  onPaneContextMenu,
  onPaneScroll,
  onElementsRemove,
  deleteKeyCode,
  onMove,
  onMoveStart,
  onMoveEnd,
  selectionKeyCode,
  multiSelectionKeyCode,
  zoomActivationKeyCode,
  elementsSelectable,
  zoomOnScroll,
  zoomOnPinch,
  panOnScroll,
  panOnScrollSpeed,
  panOnScrollMode,
  zoomOnDoubleClick,
  paneMoveable,
  defaultPosition,
  defaultZoom,
  translateExtent,
  preventScrolling,
  onSelectionDragStart,
  onSelectionDrag,
  onSelectionDragStop,
  onSelectionContextMenu,
}) {
  const resetSelectedElements = useResetSelectedElements();
  const selectionKeyPressed = useKeyPress(selectionKeyCode);
  useGlobalKeyHandler({
    onElementsRemove,
    deleteKeyCode,
    multiSelectionKeyCode,
  });
  const onClick = useCallback(
    (event) => {
      onPaneClick?.(event);
      resetSelectedElements();
    },
    [onPaneClick]
  );
  const onContextMenu = useCallback(
    (event) => {
      onPaneContextMenu?.(event);
    },
    [onPaneContextMenu]
  );
  const onWheel = useCallback(
    (event) => {
      onPaneScroll?.(event);
    },
    [onPaneScroll]
  );
  return (
    <ZoomPane
      onMove={onMove}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      selectionKeyPressed={selectionKeyPressed}
      elementsSelectable={elementsSelectable}
      zoomOnScroll={zoomOnScroll}
      zoomOnPinch={zoomOnPinch}
      panOnScroll={panOnScroll}
      panOnScrollSpeed={panOnScrollSpeed}
      panOnScrollMode={panOnScrollMode}
      zoomOnDoubleClick={zoomOnDoubleClick}
      paneMoveable={paneMoveable}
      defaultPosition={defaultPosition}
      defaultZoom={defaultZoom}
      translateExtent={translateExtent}
      zoomActivationKeyCode={zoomActivationKeyCode}
      preventScrolling={preventScrolling}
    >
      {children}
      <BoxSelection selectionKeyPressed={selectionKeyPressed} />
      <div
        className="react-flow__pane"
        onClick={onClick}
        onDoubleClick={onPaneDoubleClick}
        onContextMenu={onContextMenu}
        onWheel={onWheel}
      />
    </ZoomPane>
  );
});
