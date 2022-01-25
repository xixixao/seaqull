import * as Layout from "editor/Layout";
import ReactFlow, { Background, ReactFlowProvider } from "editor/react-flow";
import { useStore } from "editor/react-flow/store/hooks";
import {
  AppStateContextProvider,
  useAppStateContext,
  useSetAppStateContext,
} from "editor/state";
import { styled } from "editor/style";
import { PaneControls } from "editor/ui/PaneControls";
import * as Edges from "graph/Edges";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { LayoutRequestProvider } from "./AddNodeButton";
import { positionToRendererPosition } from "./react-flow/utils/graph";

function App({
  initialState,
  topUI,
  children,
  nodeTypes,
  onDoubleClick,
  onKeyDown,
}) {
  return (
    <AppStateContextProvider initialState={initialState}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <ReactFlowProvider>
          <NodesPane
            nodeTypes={nodeTypes}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
          >
            {topUI}
          </NodesPane>
        </ReactFlowProvider>
        <div
          style={{
            flexGrow: 1,
            maxHeight: "50%",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    </AppStateContextProvider>
  );
}

const Div = styled("div");

const PAN_SETTINGS = {
  MAC: {
    panOnScroll: true,
    paneMoveable: false,
  },
  // TODO: if desired
  WINDOWS: {},
};

function NodesPane({ children, nodeTypes, onDoubleClick, onKeyDown }) {
  //   const onElementsRemove = (elementsToRemove) =>
  //     setElements((els) => removeElements(elementsToRemove, els));
  // const onConnect = (params) => setElements((els) => addEdge(params, els));
  // const updateNodePosDiff = useStoreActions(
  //   (actions) => actions.updateNodePosDiff
  // );
  const appState = useAppStateContext();
  const setAppState = useSetAppStateContext();
  const store = useStore();

  const layoutRequestRef = useRef(null);
  useLayoutEffect(() => {
    if (layoutRequestRef.current != null) {
      const request = layoutRequestRef.current;
      setAppState((appState) => {
        const [nodeID, layoutCallback] = request;
        if (Nodes.positionWithID(appState, nodeID).height != null) {
          const node = Nodes.nodeWithID(appState, nodeID);
          layoutCallback(appState, node);
        }
      });
      layoutRequestRef.current = null;
    }
  }, [appState, setAppState]);

  const onRequestLayout = useCallback((request) => {
    if (request == null) {
      return;
    }
    layoutRequestRef.current = request;
  }, []);

  const onSelectionChange = useCallback(
    (elements) => {
      const nodes = (elements ?? []).filter(
        (element) => element.source == null
      );
      setAppState((appState) => {
        if (
          !Arrays.isEqual(
            nodes.map(Node.id),
            Array.from(appState.selectedNodeIDs)
          )
        ) {
          Nodes.select(appState, nodes);
        }
      });
    },
    [setAppState]
  );

  return (
    <LayoutRequestProvider value={onRequestLayout}>
      <Div
        css={{
          height: "65%",
          borderBottom: "1px solid $slate7",
          // borderTop: "1px solid $slate7",
          outline: "none",
        }}
        tabIndex="-1"
        onDoubleClick={(event) => {
          setAppState((appState) => {
            onRequestLayout(
              onDoubleClick(
                appState,
                positionToRendererPosition(store, {
                  x: event.clientX,
                  y: event.clientY,
                })
              )
            );
          });
        }}
        onKeyDown={(event) => {
          setAppState((appState) => {
            if (event.key === "Backspace") {
              if (Nodes.countSelected(appState) === 0) {
                return;
              }

              const tightGroups = Nodes.groupBy(
                Nodes.selected(appState),
                (node) => Nodes.tightRoot(appState, node)
              ).map((nodes) => Nodes.sortTight(appState, nodes));
              const parentsToSelect = tightGroups.map((nodes) => {
                const firstNode = Arrays.first(nodes);

                const tightParent = Nodes.tightParent(appState, firstNode);
                const lastNode = Arrays.last(nodes);
                const children = Nodes.tightChildren(appState, lastNode);

                nodes.forEach((node) => Nodes.remove(appState, node));

                if (tightParent != null) {
                  Edges.addTightChildren(appState, tightParent, children);
                  Layout.layoutTightStack(appState, tightParent);
                }

                return tightParent;
              });

              Nodes.select(
                appState,
                parentsToSelect.filter((node) => node != null)
              );
            } else {
              onRequestLayout(onKeyDown(appState, event));
            }
          });
        }}
      >
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={EDGE_COMPONENTS}
          onSelectionChange={onSelectionChange}
          zoomOnDoubleClick={false}
          {...PAN_SETTINGS.MAC}
          // onElementsRemove={onElementsRemove}
          // onConnect={onConnect}
          // onLoad={onLoad}
        >
          {/* <MiniMap
        nodeStrokeColor={(n) => {
          if (n.style?.background) return n.style.background;
          if (n.type === "input") return "#0041d0";
          if (n.type === "output") return "#ff0072";
          if (n.type === "default") return "#1a192b";

          return "#eee";
        }}
        nodeColor={(n) => {
          if (n.style?.background) return n.style.background;

          return "#fff";
        }}
        nodeBorderRadius={2}
      /> */}

          <div
            style={{
              position: "absolute",
              padding: 4,
              zIndex: 5,
              transform: "translate(-50%, 0)",
              top: 0,
              left: "50%",
            }}
          >
            {children}
          </div>
          <PaneControls showInteractive={false} />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </Div>
    </LayoutRequestProvider>
  );
}

const EDGE_COMPONENTS = {
  tight: function TightEdge() {
    return <></>;
  },
};

export default App;
