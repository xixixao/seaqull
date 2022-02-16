import cc from "classcat";
import React, { forwardRef, useMemo } from "react";
import {
  BezierEdge,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
} from "../../components/Edges";
import DefaultNode from "../../components/Nodes/DefaultNode";
import InputNode from "../../components/Nodes/InputNode";
import OutputNode from "../../components/Nodes/OutputNode";
import "../../style.css";
import "../../theme-default.css";
import {
  ConnectionLineType,
  ConnectionMode,
  PanOnScrollMode,
} from "../../types";
import { createEdgeTypes } from "../EdgeRenderer/utils";
import GraphView from "../GraphView";
import { createNodeTypes } from "../NodeRenderer/utils";
import Wrapper from "./Wrapper";
const defaultNodeTypes = {
  input: InputNode,
  default: DefaultNode,
  output: OutputNode,
};
const defaultEdgeTypes = {
  default: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
};

const snapGridDefault = [15, 15];
const ReactFlow = forwardRef(
  (
    {
      elements = [],
      className,
      nodeTypes = defaultNodeTypes,
      edgeTypes = defaultEdgeTypes,
      onElementClick,
      onLoad,
      onMove,
      onMoveStart,
      onMoveEnd,
      onElementsRemove,
      onConnect,
      onConnectStart,
      onConnectStop,
      onConnectEnd,
      onNodeMouseEnter,
      onNodeMouseMove,
      onNodeMouseLeave,
      onNodeContextMenu,
      onNodeDoubleClick,
      onNodeDragStart,
      onNodeDrag,
      onNodeDragStop,
      onSelectionDragStart,
      onSelectionDrag,
      onSelectionDragStop,
      onSelectionContextMenu,
      connectionMode = ConnectionMode.Strict,
      connectionLineType = ConnectionLineType.Bezier,
      connectionLineStyle,
      connectionLineComponent,
      deleteKeyCode = "Backspace",
      selectionKeyCode = "Shift",
      multiSelectionKeyCode = "Meta",
      zoomActivationKeyCode = "Meta",
      snapToGrid = false,
      snapGrid = snapGridDefault,
      onlyRenderVisibleElements = false,
      selectNodesOnDrag = true,
      nodesDraggable,
      nodesConnectable,
      elementsSelectable,
      minZoom,
      maxZoom,
      defaultZoom = 1,
      defaultPosition = [0, 0],
      translateExtent,
      preventScrolling = true,
      nodeExtent,
      arrowHeadColor = "#b1b1b7",
      markerEndId,
      zoomOnScroll = true,
      zoomOnPinch = true,
      panOnScroll = false,
      panOnScrollSpeed = 0.5,
      panOnScrollMode = PanOnScrollMode.Free,
      zoomOnDoubleClick = true,
      paneMoveable = true,
      onPaneClick,
      onPaneDoubleClick,
      onPaneScroll,
      onPaneContextMenu,
      children,
      onEdgeUpdate,
      onEdgeContextMenu,
      onEdgeDoubleClick,
      onEdgeMouseEnter,
      onEdgeMouseMove,
      onEdgeMouseLeave,
      onEdgeUpdateStart,
      onEdgeUpdateEnd,
      edgeUpdaterRadius = 10,
      nodeTypesId = "1",
      edgeTypesId = "1",
      ...rest
    },
    ref
  ) => {
    const nodeTypesParsed = useMemo(
      () => createNodeTypes(nodeTypes),
      [nodeTypesId]
    );
    const edgeTypesParsed = useMemo(
      () => createEdgeTypes(edgeTypes),
      [edgeTypesId]
    );
    const reactFlowClasses = cc(["react-flow", className]);
    return (
      <div {...rest} ref={ref} className={reactFlowClasses}>
        <Wrapper>
          <GraphView
            onLoad={onLoad}
            onMove={onMove}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
            onElementClick={onElementClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseMove={onNodeMouseMove}
            onNodeMouseLeave={onNodeMouseLeave}
            onNodeContextMenu={onNodeContextMenu}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypesParsed}
            edgeTypes={edgeTypesParsed}
            connectionMode={connectionMode}
            connectionLineType={connectionLineType}
            connectionLineStyle={connectionLineStyle}
            connectionLineComponent={connectionLineComponent}
            selectionKeyCode={selectionKeyCode}
            onElementsRemove={onElementsRemove}
            deleteKeyCode={deleteKeyCode}
            multiSelectionKeyCode={multiSelectionKeyCode}
            zoomActivationKeyCode={zoomActivationKeyCode}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectStop={onConnectStop}
            onConnectEnd={onConnectEnd}
            snapToGrid={snapToGrid}
            snapGrid={snapGrid}
            onlyRenderVisibleElements={onlyRenderVisibleElements}
            nodesDraggable={nodesDraggable}
            nodesConnectable={nodesConnectable}
            elementsSelectable={elementsSelectable}
            selectNodesOnDrag={selectNodesOnDrag}
            minZoom={minZoom}
            maxZoom={maxZoom}
            defaultZoom={defaultZoom}
            defaultPosition={defaultPosition}
            translateExtent={translateExtent}
            preventScrolling={preventScrolling}
            nodeExtent={nodeExtent}
            arrowHeadColor={arrowHeadColor}
            markerEndId={markerEndId}
            zoomOnScroll={zoomOnScroll}
            zoomOnPinch={zoomOnPinch}
            zoomOnDoubleClick={zoomOnDoubleClick}
            panOnScroll={panOnScroll}
            panOnScrollSpeed={panOnScrollSpeed}
            panOnScrollMode={panOnScrollMode}
            paneMoveable={paneMoveable}
            onPaneClick={onPaneClick}
            onPaneDoubleClick={onPaneDoubleClick}
            onPaneScroll={onPaneScroll}
            onPaneContextMenu={onPaneContextMenu}
            onSelectionDragStart={onSelectionDragStart}
            onSelectionDrag={onSelectionDrag}
            onSelectionDragStop={onSelectionDragStop}
            onSelectionContextMenu={onSelectionContextMenu}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeContextMenu={onEdgeContextMenu}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseMove={onEdgeMouseMove}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            edgeUpdaterRadius={edgeUpdaterRadius}
          />
          {children}
        </Wrapper>
      </div>
    );
  }
);
ReactFlow.displayName = "ReactFlow";
export default ReactFlow;
