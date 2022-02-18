import * as History from "editor/History";
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
import * as Edge from "graph/Edge";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import * as Serialize from "js/Serialize";
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useEventListener } from "../react/useEventListener";
import { useAppRedo, useAppUndo } from "./historyHooks";
import { buildKeyMap } from "./keybindings";
import { LayoutRequestContext } from "./layoutRequest";
import { positionToRendererPosition } from "./react-flow/utils/graph";
import { useState } from "react";

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

function NodesPane({ children, nodeTypes, onKeyDown, onDoubleClick }) {
  const setAppState = useSetAppStateContext();
  const store = useStore();
  const onRequestLayout = useLayoutRequestEffect();
  useKeyListeners(onRequestLayout, onKeyDown);
  const [mousePosition, mouseHandlers] = useMousePosition();
  useClipboardListeners(mousePosition);

  return (
    <LayoutRequestContext.Provider value={onRequestLayout}>
      <Div
        css={{
          height: "65%",
          borderBottom: "1px solid $slate7",
          // borderTop: "1px solid $slate7",
          outline: "none",
        }}
        tabIndex="-1"
        {...mouseHandlers}
      >
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={EDGE_COMPONENTS}
          zoomOnDoubleClick={false}
          onPaneDoubleClick={(event) => {
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
    </LayoutRequestContext.Provider>
  );
}

const EDGE_COMPONENTS = {
  tight: function TightEdge() {
    return <></>;
  },
};

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState(null);
  const onMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };
  const onMouseLeave = () => {
    setMousePosition(null);
  };
  return [mousePosition, { onMouseMove, onMouseLeave }];
}

function useClipboardListeners(mousePosition) {
  const store = useStore();
  const appState = useAppStateContext();
  console.log(appState);
  const setAppState = useSetAppStateContext();

  useEventListener(
    document,
    "copy",
    useCallback(
      (event) => {
        copySelectedNodes(event, appState);
      },
      [appState]
    )
  );
  useEventListener(
    document,
    "paste",
    useCallback(
      (event) => {
        setAppState((appState) => {
          pasteSelectedNodes(
            event,
            appState,
            positionToRendererPosition(
              store,
              mousePosition ?? { x: 100, y: 100 }
            )
          );
        });
      },
      [mousePosition, setAppState, store]
    )
  );
}

function useKeyListeners(onRequestLayout, onKeyDown) {
  const undo = useAppUndo();
  const redo = useAppRedo();
  const appState = useAppStateContext();
  const setAppState = useSetAppStateContext();

  const onKeyDownAppDefaults = useMemo(
    () =>
      buildKeyMap([
        { key: "Backspace", run: deleteSelectedNodes },
        { key: "ArrowUp", run: selectNodesViaArrow },
        { key: "ArrowDown", run: selectNodesViaArrow },
        { key: "Mod-a", run: selectAllNodes },
        { key: "Mod-z", run: undo },
        { key: "Mod-y", mac: "Mod-Shift-z", run: redo },
      ]),
    [redo, undo]
  );

  useEventListener(
    document,
    "keydown",
    useCallback(
      (event) => {
        const handled = onKeyDownAppDefaults({ setAppState }, event);
        if (handled) {
          return;
        }
        setAppState((appState) => {
          if (event.key === "Alt") {
            appState.modes.alt = true;
          } else if (!handled) {
            onRequestLayout(onKeyDown(appState, event));
          }
        });
      },
      [onKeyDown, onKeyDownAppDefaults, onRequestLayout, setAppState]
    )
  );

  useEventListener(
    document,
    "keyup",
    useCallback(
      (event) => {
        setAppState((appState) => {
          if (event.key === "Alt") {
            appState.modes.alt = false;
          }
        });
      },
      [setAppState]
    )
  );
  return { appState, setAppState };
}

function useLayoutRequestEffect() {
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

  return useCallback((request) => {
    if (request == null) {
      return;
    }
    layoutRequestRef.current = request;
  }, []);
}

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

function selectAllNodes({ setAppState }, event) {
  setAppState((appState) => {
    Nodes.select(appState, Nodes.all(appState));
  });
  event.preventDefault();
}

function copySelectedNodes(event, appState) {
  (async () => {
    const nodes = Nodes.selected(appState);
    if (nodes.length === 0) {
      return;
    }
    const edges = Edges.between(appState, nodes);
    const positions = Nodes.positionsOf(appState, nodes);
    event.clipboardData.setData(
      "text/plain",
      Serialize.stringify({
        type: "seaqull/clipboard",
        nodes,
        edges,
        positions,
      })
    );
    event.preventDefault();
  })();
}

function pasteSelectedNodes(event, appState, position) {
  const pastedString = event.clipboardData.getData("text/plain");
  let pastedData = null;
  try {
    pastedData = Serialize.parse(pastedString);
  } catch (e) {
    return;
  }
  if (pastedData?.type !== "seaqull/clipboard") {
    return;
  }
  const { nodes, edges, positions } = pastedData;
  const anchor = positions.get(Node.id(Arrays.first(nodes)));
  const offset = { x: position.x - anchor.x, y: position.y - anchor.y };
  History.startRecording(appState);
  const newNodes = new Map(
    nodes.map((node) => {
      const newNode = Nodes.replicateNode(appState, node);
      const originalPosition = positions.get(Node.id(node));
      Nodes.add(appState, newNode);
      Node.move(
        appState,
        newNode,
        originalPosition.x + offset.x - 10,
        originalPosition.y + offset.y - 10
      );
      return [Node.id(node), newNode];
    })
  );
  edges.forEach((edge) => {
    Edges.add(appState, Edge.replicateEdge(edge, newNodes));
  });
  Nodes.select(appState, Arrays.values(newNodes));
  History.endRecording(appState);
}

export default App;
