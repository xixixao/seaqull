import * as Layout from "editor/Layout";
import * as History from "editor/History";
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
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { buildKeyMap } from "./keybindings";
import { LayoutRequestContext } from "./layoutRequest";
import { positionToRendererPosition } from "./react-flow/utils/graph";
import { useEffect } from "react";
import { useAppRedo, useAppUndo } from "./historyHooks";

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
      <Wrapper onKeyDown={onKeyDown}>
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
      </Wrapper>
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

function Wrapper({ children, onKeyDown }) {
  const appState = useAppStateContext();
  const setAppState = useSetAppStateContext();
  const undo = useAppUndo();
  const redo = useAppRedo();

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

  const onKeyDownAppDefaults = useMemo(
    () =>
      buildKeyMap([
        { key: "Backspace", run: deleteSelectedNodes },
        { key: "ArrowUp", run: selectNodesViaArrow },
        { key: "ArrowDown", run: selectNodesViaArrow },
        { key: "Mod-z", run: undo, preventDefault: true },
        { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
      ]),
    [redo, undo]
  );

  const keyDownListener = useCallback(
    (event) => {
      const handled = onKeyDownAppDefaults({ setAppState }, event);
      if (handled) {
        return;
      }
      setAppState((appState) => {
        if (event.key === "Alt") {
          appState.modes.alt = true;
        }
        if (!handled) {
          onRequestLayout(onKeyDown(appState, event));
        }
      });
    },
    [onKeyDown, onKeyDownAppDefaults, onRequestLayout, setAppState]
  );
  const keyUpListener = useCallback(
    (event) => {
      setAppState((appState) => {
        if (event.key === "Alt") {
          appState.modes.alt = false;
        }
      });
    },
    [setAppState]
  );
  useEffect(() => {
    document.addEventListener("keydown", keyDownListener);
    document.addEventListener("keyup", keyUpListener);
    return () => {
      document.removeEventListener("keydown", keyDownListener);
      document.removeEventListener("keyup", keyUpListener);
    };
  });

  return (
    <LayoutRequestContext.Provider value={onRequestLayout}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {children}
      </div>
    </LayoutRequestContext.Provider>
  );
}

function NodesPane({ children, nodeTypes, onDoubleClick }) {
  const setAppState = useSetAppStateContext();
  const store = useStore();
  const onRequestLayout = useContext(LayoutRequestContext);

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
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={EDGE_COMPONENTS}
        onSelectionChange={onSelectionChange}
        zoomOnDoubleClick={false}
        {...PAN_SETTINGS.MAC}
        onEdgeUpdate={(edge, { source, target }) => {
          setAppState((appState) => {
            Edges.remove(appState, edge);
            Edges.addChild(appState, Node.fake(source), Node.fake(target));
          });
        }}
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
  );
}

const EDGE_COMPONENTS = {
  tight: function TightEdge() {
    return <></>;
  },
};

function deleteSelectedNodes({ setAppState }) {
  setAppState((appState) => {
    if (Nodes.countSelected(appState) === 0) {
      return;
    }

    History.startRecording(appState);
    const tightGroups = Nodes.groupBy(Nodes.selected(appState), (node) =>
      Nodes.tightRoot(appState, node)
    ).map((nodes) => Nodes.sortTight(appState, nodes));
    const toSelect = tightGroups.map((nodes) => {
      const firstNode = Arrays.first(nodes);

      const parent = Nodes.tightParent(appState, firstNode);
      const lastNode = Arrays.last(nodes);
      const child = Nodes.tightChild(appState, lastNode);

      nodes.forEach((node) => Nodes.remove(appState, node));

      if (parent != null && child != null) {
        Edges.addTightChild(appState, parent, child);
        Layout.layoutTightStack(appState, parent);
      }

      return child ?? parent;
    });

    Nodes.select(
      appState,
      toSelect.filter((node) => node != null)
    );
    History.endRecording(appState);
  });
}

function selectNodesViaArrow({ setAppState }, event) {
  setAppState((appState) => {
    Nodes.select(
      appState,
      Nodes.selected(appState)
        .map(
          event.key === "ArrowUp"
            ? (node) => Nodes.tightParent(appState, node) ?? node
            : (node) => Nodes.tightChild(appState, node) ?? node
        )
        .filter((node) => node != null)
    );
  });
}

export default App;
