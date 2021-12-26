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
import { PlusIcon } from "@modulz/radix-icons";
import { IconButton } from "./components/IconButton";
import { only, onlyThrows } from "./Arrays";
import { createDraft, finishDraft } from "immer";
import * as GroupByNode from "./GroupByNode";

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
  console.log(Array.from(nodes.values()));
  console.log(Array.from(edges.values()));
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
        <NodesPane elements={elements} setNodeState={setNodeState} />
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

function NodesPane({ elements, setNodeState }) {
  //   const onElementsRemove = (elementsToRemove) =>
  //     setElements((els) => removeElements(elementsToRemove, els));
  // const onConnect = (params) => setElements((els) => addEdge(params, els));
  // const updateNodePosDiff = useStoreActions(
  //   (actions) => actions.updateNodePosDiff
  // );
  return (
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
                  Edges.addChildren(nodeState, tightParent, children);
                  Nodes.layout(nodeState, tightParent);
                }
              });
              Nodes.select(nodeState, []);
            }
          });
        }
      }}
    >
      <ReactFlow
        elements={elements.map((element) =>
          element.parentID != null
            ? {
                id: element.id,
                source: element.parentID,
                target: element.childID,
              }
            : element
        )}
        nodeTypes={NODE_COMPONENTS}
        edgeTypes={EDGE_COMPONENTS}
        // onNodeDrag={(event, node, draggableData) => {
        //   // setNodeState((nodeState) => {
        //   //   const draggedNode = getNode(nodeState, node.id);
        //   //   [draggedNode]
        //   //     .concat(getAllTightDescendants(nodeState, node))
        //   //     .forEach((node) => {
        //   //       node.position.x += draggableData.deltaX;
        //   //       node.position.y += draggableData.deltaY;
        //   //     });
        //   // });
        //   // return false;
        // }}
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
    const {
      id,
      data: { name },
    } = node;
    const [, setNodeState] = useElementsContext();
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
            setNodeState((nodeState) => {
              nodeState.nodes[id].data.name = name;
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
  query(nodeState, { data: { name } }) {
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

const SelectNode = {
  name: "SelectNode",
  Component(node) {
    // const selectedColumnNames = SelectNode.columnNames(nodeState, node);
    const [, setNodeState] = useElementsContext();
    return (
      <NodeUI node={node} showTools={true} tools={<FromAndTools />}>
        SELECT{" "}
        <Input
          value={
            (node.data.selectedColumnNames ?? []).length > 0
              ? node.data.selectedColumnNames.join(", ")
              : "*"
          }
          onChange={(columns) => {
            setNodeState((nodeState) => {
              nodeState.nodes[node.id].data.selectedColumnNames =
                columns.split(/, */);
            });
          }}
        />
        {/* <Handle type="target" position="top" /> */}
        {/* <Handle type="source" position="right" /> */}
      </NodeUI>
    );
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
      <>
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
        {columnName}
      </>
    );
  },
};

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
  // const [nodeState] = useElementsContext();
  // const selectedColumnNames = SelectNode.columnNames(nodeState, node);
  const selectedColumns = GroupByNode.selectedColumns(node);
  return (
    <NodeUI node={node} showTools={true} tools={<FromAndTools />}>
      <div>
        GROUP BY {selectedColumns.length > 0 ? selectedColumns.join(", ") : "∅"}
      </div>
    </NodeUI>
  );
}

const GroupNode = {
  Component: GroupNodeComponent,
  queryWhenSelected(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const fromQuery = getQuery(nodeState, sourceNode);
    const selectedColumns = GroupByNode.selectedColumns(node);
    if ((selectedColumns ?? []).length === 0) {
      return `SELECT * from (${fromQuery})`;
    }
    const selectedColumnSet = new Set(selectedColumns ?? []);
    const otherColumns = getColumnNames(nodeState, sourceNode.id).filter(
      (column) => !selectedColumnSet.has(column)
    );
    return `SELECT ${selectedColumns
      .concat(otherColumns)
      .join(", ")} FROM (${fromQuery})
      ORDER BY ${selectedColumns.join(", ")}`;
  },
  query(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const fromQuery = getQuery(nodeState, sourceNode);
    const selectedColumns = GroupByNode.selectedColumns(node);
    if ((selectedColumns ?? []).length === 0) {
      return `SELECT * from (${fromQuery})`;
    }
    return `SELECT ${selectedColumns.join(", ")}
      FROM (${fromQuery})
      GROUP BY ${selectedColumns.join(", ")}`;
  },
  queryAdditionalValues(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const fromQuery = getQuery(nodeState, sourceNode);
    const selectedColumns = GroupByNode.selectedColumns(node);
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
    const selectedColumns = GroupByNode.selectedColumns(node);
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
      <>
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
        {columnName}
      </>
    );
  },
};

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

  const isLast = !Nodes.hasChildren(nodeState, node);
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
      <Box isSelected={isSelected}>{children}</Box>
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

function AddConnectedFromNodeButon() {
  return <AddNodeButton type={FromNode}>FROM</AddNodeButton>;
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
  return NODE_TYPES[node.type];
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

function FromAndTools() {
  return (
    <Row>
      <Tools />
      <HorizontalSpace />
      <AddConnectedFromNodeButon />
    </Row>
  );
}

function Tools() {
  return (
    <>
      <AttachNodeButton type="where">WHERE</AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton type="group">GROUP BY</AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton type="select">SELECT</AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton type="order">ORDER BY</AttachNodeButton>
    </>
  );
}

function AttachNodeButton({ children, type }) {
  const [, setNodeState] = useElementsContext();
  // const nodePositions = useStoreState((store) => store.nodes);
  const attachNodeHandler = (type) => () => {
    setNodeState((nodeState) => {
      const newNode = Nodes.newNode(nodeState, { type });
      const selectedNode = onlyThrows(Nodes.selected(nodeState));
      const selectedNodeChildren = Nodes.children(nodeState, selectedNode);
      const selectedNodeChildEdges = Edges.children(nodeState, selectedNode);
      Edges.removeAll(nodeState, selectedNodeChildEdges);
      Edges.addChildren(nodeState, newNode, selectedNodeChildren);
      Edges.addChild(nodeState, selectedNode, newNode);
      Nodes.add(nodeState, newNode);
      Nodes.select(nodeState, [newNode]);
      Nodes.layout(nodeState, selectedNode);
    });
  };
  return (
    <ButtonWithIcon icon={<PlusIcon />} onClick={attachNodeHandler(type)}>
      {children}
    </ButtonWithIcon>
  );
}

function getNewNodeID(nodeState) {
  return String(
    Math.max(
      ...nodeState.nodes
        .filter(({ id }) => !id.startsWith("e"))
        .map((node) => +node.id)
    ) + 1
  );
}

function removeElement(array, element) {
  return array.filter(({ id }) => id !== element.id);
}

function edgeTight(source, target, isTight) {
  return edge(source, target, true);
}

function edge(source, target, isTight) {
  return {
    id: `e${source}${target}`,
    source: source,
    target: target,
    type: isTight ? "tight" : "default",
  };
}

function canNodeHaveManySources(node) {
  return getType(node).canHaveManySources();
}

function AddNodeButton({ children, type }) {
  const [, setNodeState] = useElementsContext();
  const nodePositions = useStoreState((store) => store.nodes);
  const addNodeHandler = (type) => () => {
    setNodeState((nodeState) => {
      const newID = getNewNodeID(nodeState);
      const maxX = Math.max(
        ...nodePositions.map(({ __rf }) => __rf.position.x + __rf.width)
      );
      nodeState.nodes.push({
        id: newID,
        type,
        data: {},
        position: { x: maxX + 30, y: INIT_Y },
      });
      nodeState.selectedNodeID = newID;
    });
  };
  return (
    <ButtonWithIcon icon={<PlusIcon />} onClick={addNodeHandler(type)}>
      {children}
    </ButtonWithIcon>
  );
}

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
        setTimeout(() => setUpdated(false), 1000);
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
  return (
    <>
      <table className={updated ? "updated" : null}>
        <thead>
          <tr>
            {columns.map((column, i) => (
              <th
                key={i}
                style={{
                  textAlign: "start",
                  whiteSpace: "nowrap",
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
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rowCount)].map((_, j) => (
            <tr key={j}>
              {values.map((rows) =>
                rows[0].map((_, i) => (
                  <td style={{ whiteSpace: "nowrap" }} key={i}>
                    {(rows[j] ?? [])[i] ?? ""}
                  </td>
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
    console.error(e);
    return null;
  }
}

const NODE_TYPES = {
  from: FromNode,
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
