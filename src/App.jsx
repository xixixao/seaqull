import * as Arrays from "./Arrays";
import * as FromNodes from "./FromNodes";
import * as NameNodes from "./NameNodes";
import * as SelectNodes from "./SelectNodes";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import { produce, original } from "./immer";
import initSqlJs from "sql.js";
import { styled } from "./style";

import * as NodeState from "./NodeState";
import * as Nodes from "./Nodes";
import * as Edges from "./Edges";
import * as Node from "./Node";
import * as Edge from "./Edge";

import ReactFlow, {
  removeElements,
  addEdge,
  Background,
  useStoreActions,
  getOutgoers,
  getIncomers,
  ReactFlowProvider,
  useStoreState,
  Handle,
  updateEdge,
} from "./react-flow";
import { Button } from "./components/Button";
import { Row } from "./components/Row";
import { PaneControls } from "./components/PaneControls";
import { ButtonWithIcon } from "./components/ButtonWithIcon";
import { DropdownMenuIcon, PlusIcon } from "@modulz/radix-icons";
import { IconButton } from "./components/IconButton";
import { only, onlyThrows } from "./Arrays";
import { createDraft, finishDraft } from "immer";
import * as GroupByNode from "./GroupByNode";
import { Tooltip } from "./components/Tooltip";
import { Column } from "./components/Column";
import { invariant } from "./invariant";
import store from "./react-flow/store";
import ElementUpdater from "./react-flow/components/ElementUpdater";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "./components/DropdownMenu";

const database = initSqlJs({
  // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
  // You can omit locateFile completely when running in node
  locateFile: (file) => `./${file}`,
}).then((SQL) => {
  const db = new SQL.Database();
  db.run(DATABASE_SETUP_SQL);
  return db;
});

// The logical ordering would be
// FROM (foo JOIN boo ON bla)
// WHERE
// SELECT
// DISTINCT | GROUP BY
// HAVING
// ORDER
// LIMIT

function App() {
  return (
    <ReactFlowProvider>
      <Content />
    </ReactFlowProvider>
  );
}

const ElementsContext = createContext();

function useElementsContext() {
  return useContext(ElementsContext);
}

function useSetSelectedNodeState() {
  const [, setNodeState] = useElementsContext();
  return useCallback(
    (producer) => {
      setNodeState((nodeState) => {
        producer(onlyThrows(Nodes.selected(nodeState)));
      });
    },
    [setNodeState]
  );
}

const NodeAddContext = createContext();

const INIT_Y = 30;

function Content() {
  const [namespace, setNamespace] = useState("foo_team");
  const [notebookName, setNotebookName] = useState("Untitled");

  const [elements, setElements] = useState([
    {
      id: "0",
      type: "from",
      data: { name: "users" },
      position: { x: 40, y: INIT_Y },
    },
    // 1: { type: FromNode, id: 1, name: null },
  ]);
  const selectedElements = useStoreState((store) => store.selectedElements);
  const setSelectedElements = useStoreActions(
    (actions) => actions.setSelectedElements
  );
  const nodes = idMap(elements.filter(({ id }) => !id.startsWith("e")));
  const edges = idMap(elements.filter(({ id }) => id.startsWith("e")));
  // console.log(Array.from(nodes.values()));
  // console.log(Array.from(edges.values()));
  const selectedNodeIDs = (selectedElements ?? []).map((element) => element.id);
  const nodeState = { nodes, edges, selectedNodeIDs };
  const setNodeState = (fn) => {
    const newState = produce(nodeState, fn);
    if (nodes !== newState.nodes || edges !== newState.edges) {
      setElements(mapValues(newState.nodes).concat(mapValues(newState.edges)));
    }
    if (selectedNodeIDs !== newState.selectedNodeIDs) {
      setSelectedElements(newState.selectedNodeIDs.map((id) => ({ id })));
    }
  };

  useEffect(() => {
    setSelectedElements({ id: "0" });
  }, [setSelectedElements]);
  // console.log(elements);

  return (
    <ElementsContext.Provider value={[nodeState, setNodeState]}>
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
        <ElementUpdater
          elements={elements.map((element) =>
            element.parentID != null
              ? {
                  ...element,
                  source: element.parentID,
                  target: element.childID,
                }
              : element
          )}
        />
        <NodesPane />
        <div style={{ padding: 8, overflowX: "scroll", flexGrow: 1 }}>
          <Table nodeState={nodeState} setNodeState={setNodeState} />
        </div>
      </div>
    </ElementsContext.Provider>
  );
}

// const onLoad = (reactFlowInstance) => {
//   console.log("flow loaded:", reactFlowInstance);
//   // reactFlowInstance.fitView();
// };

const Div = styled("div");

function idMap(array) {
  return new Map(array.map((element) => [element.id, element]));
}

function mapValues(map) {
  return Array.from(map.values());
}

function getNodePositions() {
  return store.getState().nodes;
}

function NodesPane() {
  //   const onElementsRemove = (elementsToRemove) =>
  //     setElements((els) => removeElements(elementsToRemove, els));
  // const onConnect = (params) => setElements((els) => addEdge(params, els));
  // const updateNodePosDiff = useStoreActions(
  //   (actions) => actions.updateNodePosDiff
  // );
  const [nodeState, setNodeState] = useElementsContext();
  const nodePositions = useStoreState((store) => store.nodes);

  const addedToNodeIDRef = useRef(null);
  useEffect(() => {
    if (
      addedToNodeIDRef.current != null &&
      nodePositions.find(({ id }) => id === addedToNodeIDRef.current)?.__rf
        .height != null
    ) {
      // console.log(nodePositions);
      setNodeState((nodeState) => {
        const node = Nodes.nodeWithID(nodeState, addedToNodeIDRef.current);
        const parent = Nodes.tightParent(nodeState, node);
        Nodes.layout(nodeState, parent, nodePositions);
      });
      addedToNodeIDRef.current = null;
    }
  }, [nodePositions, nodeState]);

  const onAdd = (addAction) => {
    setNodeState((nodeState) => {
      addedToNodeIDRef.current = addAction(nodeState);
    });
  };

  return (
    <NodeAddContext.Provider value={onAdd}>
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
            setNodeState((nodeState) => {
              if (Nodes.countSelected(nodeState) > 0) {
                const selectedNodes = Nodes.selected(nodeState);
                selectedNodes.forEach((node) => {
                  const tightParent = Nodes.tightParent(nodeState, node);
                  const children = Nodes.children(nodeState, node);
                  Nodes.remove(nodeState, node);
                  if (tightParent != null) {
                    Edges.addTightChildren(nodeState, tightParent, children);
                    Nodes.layout(nodeState, tightParent, nodePositions);
                  }
                });
                Nodes.select(nodeState, []);
              }
            });
          }
        }}
      >
        <ReactFlow
          nodeTypes={NODE_COMPONENTS}
          edgeTypes={EDGE_COMPONENTS}
          onNodeDrag={(event, _node, { deltaX, deltaY }) => {
            setNodeState((nodeState) => {
              const node = only(Nodes.selected(nodeState));
              const parentEdge = Edges.tightParent(nodeState, node);
              const shouldDragDetachNode =
                node != null && parentEdge != null && event.metaKey;
              if (shouldDragDetachNode) {
                const parent = Edges.parentNode(nodeState, parentEdge);
                const children = Nodes.tightChildren(nodeState, node);
                Edge.detach(parentEdge);
                Edges.removeAll(
                  nodeState,
                  Edges.tightChildren(nodeState, node)
                );
                Edges.addTightChildren(nodeState, parent, children);
                Node.moveBy(node, deltaX, deltaY);
                Nodes.layout(nodeState, parent, nodePositions);
                return;
              }
              const draggedNodeRoots = Nodes.dedupe(
                Nodes.selected(nodeState).map((node) =>
                  Nodes.tightRoot(nodeState, node)
                )
              );
              draggedNodeRoots.forEach((node) => {
                Node.moveBy(node, deltaX, deltaY);
                Nodes.layout(nodeState, node, nodePositions);
              });
            });
            return false;
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
            <AddNodeButton type="from">FROM</AddNodeButton>
          </div>
          <PaneControls showInteractive={false} />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </Div>
    </NodeAddContext.Provider>
  );
}

function nodeLists(nodeState) {
  return Object.values(nodeState.nodes)
    .filter((node) => node.type === FromNode)
    .map((fromNode) => {
      let parent = fromNode;
      const list = [parent];
      while (parent.child != null) {
        parent = nodeState.nodes[parent.child];
        list.push(parent);
      }
      return list;
    });
}

const FromNode = {
  name: "FromNode",
  Component(node) {
    const name = FromNodes.name(node);
    const setSelectedNodeState = useSetSelectedNodeState();
    const [nodeState] = useElementsContext();
    return (
      <NodeUI
        node={node}
        showTools={name?.length > 0}
        tools={
          <Row>
            <Tools />
          </Row>
        }
      >
        FROM{" "}
        <Input
          focused={name == null}
          value={name}
          onChange={(name) => {
            setSelectedNodeState((node) => {
              FromNodes.setName(node, name);
            });
          }}
        />
        {/* <Handle
          type="source"
          position="right"
          style={
            {
              // background: "white",
              // border: `1px solid ${selected ? "#0041d0" : "#1a192b"}`,
            }
          }
          // onConnect={(params) => console.log('handle onConnect', params)}
          // isConnectable={isConnectable}
        /> */}
      </NodeUI>
    );
  },
  emptyNodeData: FromNodes.empty,
  query(nodeState, node) {
    const name = FromNodes.name(node);
    const existingNode = only(
      Arrays.filter(Nodes.nodes(nodeState), (node) => Node.label(node) === name)
    );
    if (existingNode != null) {
      return getQuery(nodeState, existingNode);
    }
    return (name ?? "").length > 0 ? `SELECT * from ${name}` : null;
  },
  queryAdditionalValues(nodeState, node) {
    return null;
  },
  columnNames() {
    return COLUMNS.map(([column]) => column);
  },
  columnControl() {
    return null;
  },
};

const NameNode = {
  name: "NameNode",
  Component(node) {
    const setSelectedNodeState = useSetSelectedNodeState();
    return (
      <NodeUI node={node} showTools={true} tools={<FromAndTools />}>
        <Input
          value={NameNodes.name(node)}
          onChange={(name) => {
            setSelectedNodeState((node) => {
              NameNodes.setName(node, name);
            });
          }}
        />
        {/* <Handle type="target" position="top" /> */}
        {/* <Handle type="source" position="right" /> */}
      </NodeUI>
    );
  },
  emptyNodeData() {
    return NameNodes.empty();
  },
  query(nodeState, node) {
    return getQuery(nodeState, Nodes.parentX(nodeState, node));
  },
  queryAdditionalValues(nodeState, node) {
    return null;
  },
  columnNames(nodeState, node) {
    return getColumnNames2(nodeState, Nodes.parentX(nodeState, node));
  },
  columnControl(nodeState, node, columnName, setNodeState) {
    return null;
  },
};

const SelectNode = {
  name: "SelectNode",
  Component(node) {
    const setSelectedNodeState = useSetSelectedNodeState();
    const [nodeState] = useElementsContext();
    return (
      <NodeUI node={node} showTools={true} tools={<FromAndTools />}>
        SELECT{" "}
        <Input
          value={someOrAllColumnList(SelectNodes.selectedColumns(node))}
          onChange={(columns) => {
            setSelectedNodeState((node) => {
              SelectNodes.setSelectedColumns(node, columns.split(/, */));
            });
          }}
        />
      </NodeUI>
    );
  },
  emptyNodeData() {
    return SelectNodes.empty();
  },
  query(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const { selectedColumnNames: sourceSelectedColumnNames } = sourceNode.data;
    const { selectedColumnNames } = node.data;
    if (
      sourceNode.type === "group" &&
      (sourceSelectedColumnNames ?? []).length > 0
    ) {
      const fromQuery = getQuery(nodeState, getSource(nodeState, sourceNode));
      return `SELECT ${
        (selectedColumnNames ?? []).length > 0
          ? selectedColumnNames.join(", ")
          : sourceSelectedColumnNames.join(", ")
      } FROM (${fromQuery})
      GROUP BY ${sourceSelectedColumnNames.join(", ")}`;
    }

    const fromQuery = getQuery(nodeState, sourceNode);
    return `SELECT ${
      (selectedColumnNames ?? []).length > 0
        ? selectedColumnNames.join(", ")
        : "*"
    } FROM (${fromQuery})`;
  },
  queryAdditionalValues(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const fromQuery = getQuery(nodeState, sourceNode);
    const { selectedColumnNames: sourceSelectedColumnNames } = sourceNode.data;
    const { selectedColumnNames } = node.data;
    if (
      sourceNode.type === GroupNode &&
      (sourceSelectedColumnNames ?? []).length > 0
    ) {
      const otherGroupByColumns = subtractArrays(
        getColumnNames(nodeState, sourceNode.id),
        selectedColumnNames ?? []
      );
      return [
        (selectedColumnNames ?? []).length > 0 && otherGroupByColumns.length > 0
          ? `SELECT ${otherGroupByColumns.join(", ")} FROM (${fromQuery})`
          : null,
        ...GroupNode.queryAdditionalValues(nodeState, sourceNode),
      ];
    }
    if ((selectedColumnNames ?? []).length === 0) {
      return null;
    }
    const otherColumns = subtractArrays(
      getColumnNames(nodeState, sourceNode.id),
      selectedColumnNames ?? []
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  columnNames(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    return (node.data.selectedColumnNames ?? []).length > 0
      ? node.data.selectedColumnNames
      : getColumnNames(nodeState, sourceNode.id);
  },
  columnControl(nodeState, node, columnName, setNodeState) {
    // const selectableColumnNames = getColumnNames(nodeState, node.source);
    // TODO: Fix O(N^2) algo to be nlogn
    // if (!selectableColumnNames.find((column) => column === columnName)) {
    //   return null;
    // }
    const selectedColumnNamesNotNull = node.data.selectedColumnNames ?? [];
    const selectedColumnNamesSet = new Set(selectedColumnNamesNotNull);
    return (
      <Row align="center">
        <input
          checked={selectedColumnNamesSet.has(columnName)}
          style={{ cursor: "pointer" }}
          type="checkbox"
          onChange={(event) => {
            setNodeState((nodeState) => {
              getSelectedNode(nodeState).data.selectedColumnNames =
                !selectedColumnNamesSet.has(columnName)
                  ? selectedColumnNamesNotNull.concat([columnName])
                  : selectedColumnNamesNotNull.filter(
                      (key) => key !== columnName
                    );
            });
          }}
        />
        <HorizontalSpace />
        <HorizontalSpace />
        {columnName}
        <HorizontalSpace />
      </Row>
    );
  },
};

function visibleIf(bool) {
  return { visibility: bool ? "visible" : "hidden" };
}

const WhereNode = {
  name: "WhereNode",
  Component({ node, nodeState, setNodeState }) {
    // const { filters: _ } = node;
    return (
      <NodeUI
        node={node}
        nodeState={nodeState}
        showTools={true}
        setNodeState={setNodeState}
      >
        WHERE {"id > 4 AND dau = 0"}
      </NodeUI>
    );
  },
  emptyNodeData() {},
  canHaveManySources() {
    return false;
  },
  query(nodeState, { source }) {
    const fromQuery = getQuery(nodeState, source);
    return `SELECT * from (${fromQuery}) WHERE id > 4 AND dau = 0`;
  },
  queryAdditionalValues(nodeState, { source }) {
    return [];
  },
  columnNames(nodeState, { source }) {
    return getColumnNames(nodeState, source);
  },
  columnControl() {
    return null;
  },
};

function GroupNodeComponent(node) {
  return (
    <NodeUI node={node} showTools={true} tools={<FromAndTools />}>
      <div>
        GROUP BY {someOrNoneColumnList(GroupByNode.groupedColumns(node))}
      </div>
      <div>SELECT {someOrAllColumnList(GroupByNode.selectedColumns(node))}</div>
    </NodeUI>
  );
}

function someOrNoneColumnList(columnNames) {
  return columnNames.length > 0 ? columnNames.join(", ") : "∅";
}

function someOrAllColumnList(columnNames) {
  return columnNames.length > 0 ? columnNames.join(", ") : "*";
}

const GroupNode = {
  Component: GroupNodeComponent,
  emptyNodeData: GroupByNode.empty,
  // queryWhenSelected(nodeState, node) {
  //   const sourceNode = getSource(nodeState, node);
  //   const fromQuery = getQuery(nodeState, sourceNode);
  //   const selectedColumns = GroupByNode.selectedColumns(node);
  //   if (selectedColumns.length === 0) {
  //     return `SELECT * from (${fromQuery})`;
  //   }
  //   const selectedColumnSet = new Set(selectedColumns ?? []);
  //   const otherColumns = getColumnNames(nodeState, sourceNode.id).filter(
  //     (column) => !selectedColumnSet.has(column)
  //   );
  //   return `SELECT ${selectedColumns
  //     .concat(otherColumns)
  //     .join(", ")} FROM (${fromQuery})
  //     ORDER BY ${selectedColumns.join(", ")}`;
  // },
  query(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const fromQuery = getQuery(nodeState, sourceNode);
    const selectedColumns = GroupByNode.selectedColumns(node);
    if (selectedColumns.length === 0) {
      return `SELECT * from (${fromQuery})`;
    }

    return `SELECT ${selectedColumns.join(", ")}
      FROM (${fromQuery})
      GROUP BY ${GroupByNode.groupedColumns(node).join(", ")}`;
  },
  queryAdditionalValues(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const fromQuery = getQuery(nodeState, sourceNode);
    const selectedColumns = GroupByNode.groupedColumns(node);
    if ((selectedColumns ?? []).length === 0) {
      return null;
    }
    const otherColumns = subtractArrays(
      getColumnNames(nodeState, sourceNode.id),
      selectedColumns ?? []
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  columnNames(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const selectedColumns = GroupByNode.groupedColumns(node);
    return (selectedColumns ?? []).length > 0
      ? selectedColumns
      : getColumnNames(nodeState, sourceNode.id);
  },
  columnControl(nodeState, node, columnName, setNodeState) {
    const sourceNode = getSource(nodeState, node);
    const selectableColumnNames = getColumnNames(nodeState, sourceNode.id);
    // TODO: Fix O(N^2) algo to be nlogn
    if (!selectableColumnNames.find((column) => column === columnName)) {
      return null;
    }
    const selectedColumnNamesNotNull = node.data.selectedColumnNames ?? [];
    const selectedColumnNamesSet = new Set(selectedColumnNamesNotNull);
    return (
      <Row align="center">
        <input
          checked={selectedColumnNamesSet.has(columnName)}
          style={{ cursor: "pointer" }}
          type="checkbox"
          onChange={(event) => {
            setNodeState((nodeState) => {
              getSelectedNode(nodeState).data.selectedColumnNames =
                !selectedColumnNamesSet.has(columnName)
                  ? selectedColumnNamesNotNull.concat([columnName])
                  : selectedColumnNamesNotNull.filter(
                      (key) => key !== columnName
                    );
            });
          }}
        />
        <HorizontalSpace />
        <HorizontalSpace />
        {columnName}
        <AggregationSelector
          onChange={(aggregation) => {
            setNodeState((nodeState) => {
              GroupByNode.addAggregation(
                onlyThrows(Nodes.selected(nodeState)),
                columnName,
                aggregation
              );
            });
          }}
        />
      </Row>
    );
  },
};

function AggregationSelector({ onChange }) {
  return (
    <ShowOnClick
      css={{ position: "absolute", top: "100%", background: "$slate7" }}
      trigger={
        <IconButton>
          <DropdownMenuIcon />
        </IconButton>
      }
    >
      <Column>
        {Object.keys(GroupByNode.AGGREGATIONS).map((aggregation) => (
          <Button
            css={{ marginTop: "$4" }}
            key={aggregation}
            onClick={() => onChange(aggregation)}
          >
            {aggregation}
          </Button>
        ))}
      </Column>
    </ShowOnClick>
    /* <Tooltip content="Select aggregation" side="bottom" align="start">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DropdownMenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>Hello</DropdownMenuContent>
      </DropdownMenu>
    </Tooltip> */
  );
}

const OrderNode = {
  name: "OrderNode",
  Component({ node, nodeState, setNodeState }) {
    return (
      <NodeInput
        label="ORDER BY"
        value={
          Object.keys(node.columnToOrder ?? {}).length === 0
            ? "∅"
            : OrderNode.orderClause(node)
        }
        node={node}
        nodeState={nodeState}
        showTools={true}
        setNodeState={setNodeState}
        onChange={(orderClause) => {
          setNodeState((nodeState) => {
            let columnToOrder = {};
            orderClause
              .split(/, */)
              .map((columnOrder) => columnOrder.split(/ +/))
              .filter(([column]) => column !== "∅")
              .forEach(([column, order]) => {
                columnToOrder[column] = order ?? "ASC";
              });
            nodeState.nodes[node.id].columnToOrder = columnToOrder;
          });
        }}
      />
    );
  },
  emptyNodeData() {},
  // TODO: Should leave the order entirely to the user
  orderClause(node) {
    const columnToOrder = node.columnToOrder ?? {};
    return Object.keys(columnToOrder)
      .map((column) => `${column} ${columnToOrder[column]}`)
      .join(", ");
  },
  query(nodeState, node) {
    const fromQuery = getQuery(nodeState, node.source);
    if (Object.keys(node.columnToOrder ?? {}).length === 0) {
      return fromQuery;
    }
    return `SELECT * FROM  (${fromQuery})
    ORDER BY ${OrderNode.orderClause(node)}`;
  },
  queryAdditionalValues() {
    return null;
  },
  columnNames(nodeState, { source }) {
    return getColumnNames(nodeState, source);
  },
  columnControl(nodeState, node, columnName, setNodeState) {
    // const selectableColumnNames = getColumnNames(nodeState, node.source);
    // // TODO: Fix O(N^2) algo to be nlogn
    // if (!selectableColumnNames.find((column) => column === columnName)) {
    //   return null;
    // }
    const columnToOrderNotNull = node.columnToOrder ?? {};
    const state = columnToOrderNotNull[columnName];
    return (
      <>
        <Button
          onClick={() => {
            setNodeState((nodeState) => {
              nodeState.nodes[node.id].columnToOrder = produce(
                columnToOrderNotNull,
                (map) => {
                  switch (state) {
                    case "ASC":
                      map[columnName] = "DESC";
                      break;
                    case "DESC":
                      delete map[columnName];
                      break;
                    default:
                      map[columnName] = "ASC";
                  }
                }
              );
            });
          }}
        >
          {(() => {
            switch (state) {
              case "ASC":
                return "▲";
              case "DESC":
                return "▼";
              default:
                return "-";
            }
          })()}
        </Button>
        <HorizontalSpace />
      </>
    );
  },
};

function NodeInput({
  label,
  node,
  nodeState,
  value,
  showTools,
  setNodeState,
  children,
  onChange,
}) {
  const { selectedNodeID } = nodeState;
  const isSelected = node.id === selectedNodeID;
  return (
    <NodeUI
      node={node}
      nodeState={nodeState}
      showTools={showTools}
      setNodeState={setNodeState}
    >
      {label}{" "}
      <Input
        displayValue={isSelected ? value : value.slice(0, 10) + "..."}
        value={value}
        onChange={onChange}
      />
    </NodeUI>
  );
}

function NodeUI({ node, showTools, tools, children }) {
  const isSelected = node.selected;
  const [nodeState] = useElementsContext();

  const isLast = !Nodes.hasTightChildren(nodeState, node);
  const toolsWithPosition = (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        // transform: "translate(0, -50%)",
        // width: 340,
      }}
    >
      {tools}
    </div>
  );
  return (
    <div>
      <Box isSelected={isSelected}>
        {children}
        <Handle
          style={visibleIf(Nodes.hasDetachedParents(nodeState, node))}
          type="target"
          position="left"
        />
        <Handle
          style={visibleIf(Nodes.hasDetachedChildren(nodeState, node))}
          type="source"
          position="right"
        />
      </Box>
      <Div
        css={{
          position: "absolute",
          left: "100%",
          top: "100%",
          transform: "translate(-100%, -30%)",
        }}
      >
        {Node.label(node)}
      </Div>
      {!showTools || !isSelected ? null : isLast ? (
        toolsWithPosition
      ) : (
        <FloatOnHover
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translate(-100%, -50%)",
          }}
          trigger={
            <IconButton>
              <PlusIcon />
            </IconButton>
          }
        >
          {toolsWithPosition}
        </FloatOnHover>
      )}
      {/* <HorizontalSpace /> */}
      {/* <DeleteNodeButton node={node} /> */}
      {/* {isSelected && showTools ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 2,
              left: "100%",
              width: 300,
            }}
          >
            <HorizontalSpace />
            <AddConnectedFromNodeButon />
          </div>
          <div style={{ position: "absolute", top: "110%", width: 300 }}>
            <Tools />
          </div>
        </>
      ) : null} */}
    </div>
  );
}

function FloatOnHover({ style, trigger, children }) {
  const [isFloating, setIsFloating] = useState(false);
  // const floated = React.cloneElement(React.Children.only(children), {
  //   onMouseLeave: () => setIsFloating(false),
  // });
  return (
    <>
      <div style={style} onMouseEnter={() => setIsFloating(true)}>
        {trigger}
      </div>
      {isFloating ? (
        <div onMouseLeave={() => setIsFloating(false)}>{children}</div>
      ) : null}
    </>
  );
}

function ShowOnClick({ css, trigger, children }) {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setIsShowing(true)}>{trigger}</div>
      {isShowing ? (
        <Box css={css} onMouseLeave={() => setIsShowing(false)}>
          {children}
        </Box>
      ) : null}
    </div>
  );
}

// function Selectable({ node, children }) {
//   const [, setNodeState] = useElementsContext();
//   return (
//     <span
//       onClick={() => {
//         setNodeState((nodeState) => {
//           nodeState.selectedNodeID = node.id;
//         });
//       }}
//     >
//       {children}
//     </span>
//   );
// }

function DeleteNodeButton({ node }) {
  const [, setNodeState] = useElementsContext();
  return (
    <Button
      onClick={() => {
        setNodeState((nodeState) => {
          nodeState.selectedNodeID = getSource(nodeState, node).id;
          nodeState.nodes = removeElements([node], nodeState.nodes);
        });
      }}
    >
      ×
    </Button>
  );
}

function TightEdge() {
  return <></>;
}

function subtractArrays(a, b) {
  const bSet = new Set(b);
  return a.filter((column) => !bSet.has(column));
}

function getNode(nodeState, id) {
  return nodeState.nodes.get(id);
}

const TO_SOURCE = false;
const TO_TARGET = true;

function getSource(nodeState, node) {
  return only(Nodes.parents(nodeState, node));
}

function getTarget(nodeState, node) {
  return getTightChild(nodeState, node, TO_TARGET);
}

function getTightChild(nodeState, node, direction) {
  return (
    direction === TO_SOURCE
      ? getIncomers(node, nodeState.nodes)
      : getOutgoers(node, nodeState.nodes)
  )[0];
}

function getTightDescendants(nodeState, node, direction) {
  const descendants = [];
  let parent = node;
  do {
    const tightChild = getTightChild(nodeState, parent, direction);
    if (tightChild != null) {
      descendants.push(tightChild);
    }
    parent = tightChild;
  } while (parent != null);
  return descendants;
}

function getAllTightDescendants(nodeState, node) {
  return getTightDescendants(nodeState, node, TO_SOURCE).concat(
    getTightDescendants(nodeState, node, TO_TARGET)
  );
}

function getType(node) {
  const type = NODE_TYPES[node.type];
  invariant(type != null);
  return type;
}

function getQuery(nodeState, node) {
  return getType(node).query(nodeState, node);
}

function getQueryAdditionalValues(nodeState, node) {
  return getType(node).queryAdditionalValues(nodeState, node);
}

function getColumnNames(nodeState, id) {
  const node = getNode(nodeState, id);
  return getType(node).columnNames(nodeState, node);
}

function getColumnNames2(nodeState, node) {
  return getType(node).columnNames(nodeState, node);
}

function FromAndTools() {
  return (
    <Row>
      <Tools />
      <HorizontalSpace />
      <AttachNodeButton onAdd={attachJoinNode}>JOIN</AttachNodeButton>
    </Row>
  );
}

function Tools() {
  return (
    <>
      <AttachNodeButton onAdd={attachTightNode("where")}>
        WHERE
      </AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton onAdd={attachTightNode("group")}>
        GROUP BY
      </AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton onAdd={attachTightNode("select")}>
        SELECT
      </AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton onAdd={attachTightNode("order")}>
        ORDER BY
      </AttachNodeButton>
    </>
  );
}

function AttachNodeButton({ children, onAdd }) {
  const onAddGlobal = useContext(NodeAddContext);
  return (
    <ButtonWithIcon
      icon={<PlusIcon />}
      onClick={() => {
        onAddGlobal(onAdd);
      }}
    >
      {children}
    </ButtonWithIcon>
  );
}

function attachTightNode(type) {
  return (nodeState, nodePositions) => {
    const data = getType({ type }).emptyNodeData();
    const newNode = Nodes.newNode(nodeState, { type, data });
    // const selectedNode = onlyThrows(Nodes.selected(nodeState));
    addAndSelectNode(nodeState, newNode);
    return Node.id(newNode);
    // Nodes.layout(nodeState, selectedNode, nodePositions);
  };
}

function attachJoinNode(nodeState, nodePositions) {
  const selectedNode = onlyThrows(Nodes.selected(nodeState));
  Nodes.ensureLabel(nodeState, selectedNode);
  const data = FromNode.emptyNodeData(Node.label(selectedNode));
  const newNode = Nodes.newNode(nodeState, { type: "from", data });
  addAndSelectNode(nodeState, newNode);
  Nodes.layoutDetached(selectedNode, newNode, nodePositions);
}

function addAndSelectNode(nodeState, newNode) {
  const selectedNode = onlyThrows(Nodes.selected(nodeState));
  const selectedNodeChildren = Nodes.tightChildren(nodeState, selectedNode);
  const selectedNodeChildEdges = Edges.tightChildren(nodeState, selectedNode);
  Edges.removeAll(nodeState, selectedNodeChildEdges);
  Edges.addTightChildren(nodeState, newNode, selectedNodeChildren);
  Edges.addTightChild(nodeState, selectedNode, newNode);
  Nodes.add(nodeState, newNode);
  Nodes.select(nodeState, [newNode]);
}

function AddNodeButton({ children, type }) {
  const [, setNodeState] = useElementsContext();
  const nodePositions = useStoreState((store) => store.nodes);
  const addNodeHandler = (type) => () => {
    setNodeState((nodeState) => {
      const data = getType({ type }).emptyNodeData();
      const newNode = Nodes.newNode(nodeState, { type, data });
      Nodes.add(nodeState, newNode);
      Nodes.select(nodeState, [newNode]);
      Nodes.layoutStandalone(newNode, nodePositions);
    });
  };
  return (
    <ButtonWithIcon icon={<PlusIcon />} onClick={addNodeHandler(type)}>
      {children}
    </ButtonWithIcon>
  );
}

// function canNodeHaveManySources(node) {
//   return getType(node).canHaveManySources();
// }

const Box = styled("div", {
  cursor: "move",
  // display: "inline-block",
  background: "$slate1",
  borderRadius: "8px",
  border: `1px solid $slate7`,
  // boxShadow: props.isSelected ? "0 0 0 0.5px #0041d0" : "none",
  // borderRadius: 4,
  // boxShadow: "rgb(201 204 209) 0px 0px 0px 1px",
  // background: props.isSelected ? "#e7f2fd" : "white",
  // boxSizing: "border-box",
  padding: "2px 8px",
  variants: {
    isSelected: {
      true: {
        borderColor: "#0041d0",
        boxShadow: "0 0 0 0.5px #0041d0",
      },
    },
  },
  // margin: "0 4px 2px 0",
});

function Table({ nodeState, setNodeState }) {
  const [tableState, setTableState] = useState();
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const selected = only(Nodes.selected(nodeState));
    if (selected == null) {
      return;
    }
    // console.log(nodeState);
    const query = getQuery(nodeState, selected);
    // console.log(query);
    const queryAdditionalValues = getQueryAdditionalValues(nodeState, selected);
    if (query != null) {
      setIsLoading(true);
    }
    database.then((database) =>
      setTimeout(() => {
        setIsLoading(false);
        setUpdated(true);
        if (query != null) {
          setTableState({
            table: execQuery(database, query),
            additionalTables: (queryAdditionalValues ?? [])
              .filter((query) => query != null)
              .map((query) => execQuery(database, query)),
            nodeState: nodeState,
          });
        }
        const DELAY_OF_SHOWING_RESULTS = 10;
        setTimeout(() => setUpdated(false), DELAY_OF_SHOWING_RESULTS);
      }, 300)
    );
  }, [nodeState]);

  if (isLoading && tableState?.table == null) {
    return <div style={{ padding: 12 }}>Loading...</div>;
  } else if (tableState?.table == null) {
    return null;
  }
  return (
    <TableLoaded
      updated={updated}
      state={tableState}
      setNodeState={setNodeState}
    />
  );
}

const TH = styled("th");
const TD = styled("td");

function TableLoaded({
  updated,
  state: { table, additionalTables, nodeState },
  setNodeState,
}) {
  // const { selectedNodeID } = nodeState;
  // const availableColumnNamesSet = getAvailableColumnNamesSet(
  //   nodeState,
  //   selectedNodeID
  // );
  // const columnNames = getAllColumnNames(nodeState, selectedNodeID);
  const selectedNode = getSelectedNode(nodeState);
  if (selectedNode == null) {
    return null;
  }
  const columns = table.columns.concat(
    ...additionalTables.map((table) => [""].concat(table.columns))
  );
  const values = [table.values].concat(
    ...additionalTables.map((table) => [[[""]], table.values])
  );
  const rowCount = Math.max(...values.map((rows) => rows.length));
  const primaryColumnCount = table.columns.length;
  return (
    <>
      <table className={updated ? "updated" : null}>
        <thead>
          <tr>
            {columns.map((column, i) => (
              <TH
                key={i}
                css={{
                  textAlign: "start",
                  whiteSpace: "nowrap",
                  color: i >= primaryColumnCount ? "$slate11" : null,
                  // color: availableColumnNamesSet.has(column) ? "black" : "#ddd",
                }}
              >
                {column !== ""
                  ? (() => {
                      const control = getType(selectedNode).columnControl(
                        nodeState,
                        selectedNode,
                        column,
                        setNodeState
                      );
                      return control ?? column;
                    })()
                  : null}
              </TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rowCount)].map((_, j) => (
            <tr key={j}>
              {values.map((rows, tableIndex) =>
                rows[0].map((_, i) => (
                  <TD
                    css={{
                      whiteSpace: "nowrap",
                      color: tableIndex > 0 ? "$slate11" : null,
                    }}
                    key={i}
                  >
                    {(rows[j] ?? [])[i] ?? ""}
                  </TD>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Group
      {columns.map((column) => column)}
      <Button>+∇ </Button> */}
    </>
  );
}

function getSelectedNode(nodeState) {
  return only(Nodes.selected(nodeState));
}

function Input({ displayValue, focused, label, value, onChange: setValue }) {
  const [edited, setEdited] = useState(focused ?? false ? "" : null);
  const [defaultValue] = useState(value);
  const inputRef = useRef();
  const isEditing = edited != null;
  useEffect(() => {
    if (isEditing && !inputRef.current.focused) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  const handleReset = useCallback(() => {
    if (edited === "" && value == null) {
      if (defaultValue != null) {
        setValue(defaultValue);
      } else {
        return;
      }
    }
    setEdited(null);
    setValue(edited);
  }, [defaultValue, edited, value, setValue]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (edited != null && !inputRef.current.contains(event.target)) {
        handleReset();
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [edited, handleReset]);
  return (
    <div
      style={{ display: "inline-block" }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    >
      {label != null ? <Label>{label}</Label> : null}
      {edited != null ? (
        <input
          ref={inputRef}
          style={{
            display: "block",
            outline: "none",
            borderWidth: "0 0 1px 0",
            borderColor: "#0041d0",
          }}
          type="text"
          value={edited}
          onMouseLeave={handleReset}
          onChange={(e) => setEdited(e.target.value)}
        />
      ) : (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setEdited(value ?? "")}
        >
          {displayValue ?? value}
        </div>
      )}
    </div>
  );
}

function Label(props) {
  return <span style={{ fontSize: 12 }}>{props.children}</span>;
}

function HorizontalSpace() {
  return <div style={{ flex: "0 0 2px" }}></div>;
}

function execQuery(db, sql) {
  // console.log(sql);
  try {
    return db.exec(sql)[0];
  } catch (e) {
    console.error(sql, e);
    return null;
  }
}

const NODE_TYPES = {
  from: FromNode,
  name: NameNode,
  select: SelectNode,
  where: WhereNode,
  group: GroupNode,
  order: OrderNode,
};
const NODE_COMPONENTS = objectMap(NODE_TYPES, (type) => type.Component);
const EDGE_COMPONENTS = {
  tight: TightEdge,
};

// todo move inside setup
const COLUMNS = [
  ["ds", "TEXT"],
  ["id", "INTEGER"],
  ["name", "TEXT"],
  ["dau", "INTEGER"],
  ["wau", "INTEGER"],
  ["country", "TEXT"],
  ["metadata", "TEXT"],
];
const DATABASE_SETUP_SQL = (() => {
  const tableName = "users";
  const columns = COLUMNS;
  // prettier-ignore
  const rows = [
["2042-02-03", 9, 'John', 1, 0, 'UK', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-03", 4, 'Bob', 0, 0, 'CZ', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-03", 12, 'Ross', 0, 0, 'FR', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-01", 1, 'Marline', 1, 1, 'US', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-01", 14, 'Jackie', 0, 1, 'BU', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-04", 11, 'Major', 0, 0, 'IS', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-04", 2, 'Smith', 0, 0, 'LI', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-03", 16, 'Capic', 1, 0, 'LA', "{foo: 'bar', bee: 'ba', do: 'da'}"],
  ];
  const createSql = `CREATE TABLE ${tableName} (${columns
    .map((pair) => pair.join(" "))
    .join(",")});`;
  const insertSql = `INSERT INTO ${tableName} (${columns
    .map(([column]) => column)
    .join(",")}) VALUES ${rows
    .map((row) =>
      row.map((value) => (isNaN(value) ? `"${value}"` : value)).join(",")
    )
    .map((rowSql) => `(${rowSql})`)
    .join(",")};`;
  return createSql + insertSql;
})();

// const TABLES = [
//   { value: "chocolate", label: "Chocolate" },
//   { value: "strawberry", label: "Strawberry" },
//   { value: "vanilla", label: "Vanilla" },
// ];

function objectMap(object, fn) {
  const newObject = {};
  Object.keys(object).map((key) => {
    newObject[key] = fn(object[key], key);
  });
  return newObject;
}

export default App;
