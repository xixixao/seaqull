import * as Layout from "editor/Layout";
import ReactFlow, { Background } from "editor/react-flow";
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

function App({ language }) {
  const { Results, TopUI, nodeTypes } = language;
  return (
    <AppStateContextProvider initialState={language.initialState}>
      {/* <div style={{ padding: "0 4px 4px" }}>
        <Input label="namespace" value={namespace} onChange={setNamespace} />
        <HorizontalSpace />
        <Input
          label="notebook name"
          value={notebookName}
          onChange={setNotebookName}
        />
        <HorizontalSpace />
      </div> */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <NodesPane nodeTypes={nodeTypes}>
          <TopUI />
        </NodesPane>
        <div
          style={{
            overflowX: "scroll",
            flexGrow: 1,
            maxHeight: "50%",
            padding: "0 8px",
          }}
        >
          <Results />
        </div>
      </div>
    </AppStateContextProvider>
  );
}

const Div = styled("div");

function NodesPane({ children, nodeTypes }) {
  //   const onElementsRemove = (elementsToRemove) =>
  //     setElements((els) => removeElements(elementsToRemove, els));
  // const onConnect = (params) => setElements((els) => addEdge(params, els));
  // const updateNodePosDiff = useStoreActions(
  //   (actions) => actions.updateNodePosDiff
  // );
  const appState = useAppStateContext();
  const setAppState = useSetAppStateContext();

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
        onKeyDown={(e) => {
          if (e.key === "Backspace") {
            setAppState((appState) => {
              if (Nodes.countSelected(appState) === 0) {
                return;
              }
              const parentToSelect = Nodes.tightParent(
                appState,
                only(Nodes.selected(appState))
              );

              Nodes.selected(appState).forEach((node) => {
                const tightParent = Nodes.tightParent(appState, node);
                const children = Nodes.children(appState, node);
                Nodes.remove(appState, node);
                if (tightParent != null) {
                  Edges.addTightChildren(appState, tightParent, children);
                  Layout.layoutTightStack(appState, tightParent);
                }
              });

              Nodes.select(
                appState,
                parentToSelect != null ? [parentToSelect] : []
              );
            });
          }
        }}
      >
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={EDGE_COMPONENTS}
          onSelectionChange={onSelectionChange}
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
