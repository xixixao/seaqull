import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import { produce, original } from "immer";
import initSqlJs from "sql.js";

import ReactFlow, {
  removeElements,
  addEdge,
  Controls,
  Background,
  useStoreActions,
  getOutgoers,
  getIncomers,
  ReactFlowProvider,
  useStoreState,
  Handle,
} from "react-flow-renderer";

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

function Content() {
  const [namespace, setNamespace] = useState("foo_team");
  const [notebookName, setNotebookName] = useState("Untitled");

  const [elements, setElements] = useState([
    {
      id: "0",
      type: "from",
      data: { name: "users" },
      position: { x: 40, y: 30 },
    },
    // 1: { type: FromNode, id: 1, name: null },
  ]);
  const selectedElements = useStoreState((store) => store.selectedElements);
  const setSelectedElements = useStoreActions(
    (actions) => actions.setSelectedElements
  );

  const nodeState = {
    nodes: elements,
    selectedNodeID:
      selectedElements?.length === 1 ? selectedElements[0].id : null,
  };
  const setNodeState = (fn) => {
    const newState = produce(nodeState, fn);
    if (elements !== newState.nodes) {
      setElements(newState.nodes);
    }
    setSelectedElements([{ id: newState.selectedNodeID }]);
  };

  useEffect(() => {
    setSelectedElements({ id: "0" });
  }, []);

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
        <div
          style={{
            height: "65%",
            borderBottom: "1px solid #ccc",
            borderTop: "1px solid #ccc",
          }}
        >
          <NodesPane nodeState={nodeState} setNodeState={setNodeState} />
        </div>
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

function NodesPane({ nodeState, setNodeState }) {
  //   const onElementsRemove = (elementsToRemove) =>
  //     setElements((els) => removeElements(elementsToRemove, els));
  // const onConnect = (params) => setElements((els) => addEdge(params, els));
  const updateNodePosDiff = useStoreActions(
    (actions) => actions.updateNodePosDiff
  );
  return (
    <ReactFlow
      elements={nodeState.nodes}
      nodeTypes={NODE_COMPONENTS}
      edgeTypes={EDGE_COMPONENTS}
      onSelectionChange={(nodes) =>
        setNodeState((nodeState) => {
          // nodeState.selectedNodeID = 0;
          nodeState.selectedNodeID = (nodes ?? [])[0]?.id ?? null;
        })
      }
      onNodeDrag={(event, draggableData) => {}}
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
          display: "flex",
          justifyContent: "center",
          width: "100%",
          zIndex: 5,
        }}
      >
        <AddNodeButton setNodeState={setNodeState} type={FromNode}>
          +FROM
        </AddNodeButton>
      </div>
      <Controls showInteractive={false} />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
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
      selected,
      data: { name },
    } = node;
    const [, setNodeState] = useElementsContext();
    return (
      <NodeUI node={node} showTools={name?.length > 0}>
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
        <Handle
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
        />
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
      <NodeUI node={node} showTools={true}>
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
        <Handle type="source" position="right" />
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

    const fromQuery = getQuery(nodeState, sourceNode.id);
    return `SELECT ${
      (selectedColumnNames ?? []).length > 0
        ? selectedColumnNames.join(", ")
        : "*"
    } FROM (${fromQuery})`;
  },
  queryAdditionalValues(nodeState, node) {
    const sourceNode = getSource(nodeState, node);
    const fromQuery = getQuery(nodeState, sourceNode.id);
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
    return (node.selectedColumnNames ?? []).length > 0
      ? node.selectedColumnNames
      : getColumnNames(nodeState, node.source);
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

function GroupNodeComponent({ node, nodeState, setNodeState }) {
  const selectedColumnNames = SelectNode.columnNames(nodeState, node);
  return (
    <NodeUI
      node={node}
      nodeState={nodeState}
      showTools={true}
      setNodeState={setNodeState}
    >
      GROUP BY{" "}
      {(node.selectedColumnNames ?? []).length > 0
        ? selectedColumnNames.join(", ")
        : "∅"}{" "}
    </NodeUI>
  );
}

const GroupNode = {
  Component: GroupNodeComponent,
  queryWhenSelected(nodeState, node) {
    const fromQuery = getQuery(nodeState, node.source);
    if ((node.selectedColumnNames ?? []).length === 0) {
      return `SELECT * from (${fromQuery})`;
    }
    const selectedColumnSet = new Set(node.selectedColumnNames ?? []);
    const otherColumns = getColumnNames(nodeState, node.source).filter(
      (column) => !selectedColumnSet.has(column)
    );
    return `SELECT ${node.selectedColumnNames
      .concat(otherColumns)
      .join(", ")} FROM (${fromQuery})
      ORDER BY ${node.selectedColumnNames.join(", ")}`;
  },
  query(nodeState, node) {
    const fromQuery = getQuery(nodeState, node.source);
    if ((node.selectedColumnNames ?? []).length === 0) {
      return `SELECT * from (${fromQuery})`;
    }
    return `SELECT ${node.selectedColumnNames.join(", ")}
      FROM (${fromQuery})
      GROUP BY ${node.selectedColumnNames.join(", ")}`;
  },
  queryAdditionalValues(nodeState, node) {
    const fromQuery = getQuery(nodeState, node.source);
    const otherColumns = subtractArrays(
      getColumnNames(nodeState, node.source),
      node.selectedColumnNames ?? []
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  columnNames(nodeState, node) {
    return (node.selectedColumnNames ?? []).length > 0
      ? node.selectedColumnNames
      : getColumnNames(nodeState, node.source);
  },
  columnControl(nodeState, node, columnName, setNodeState) {
    const selectableColumnNames = getColumnNames(nodeState, node.source);
    // TODO: Fix O(N^2) algo to be nlogn
    if (!selectableColumnNames.find((column) => column === columnName)) {
      return null;
    }
    const selectedColumnNamesNotNull = node.selectedColumnNames ?? [];
    const selectedColumnNamesSet = new Set(selectedColumnNamesNotNull);
    return (
      <input
        checked={selectedColumnNamesSet.has(columnName)}
        style={{ cursor: "pointer" }}
        type="checkbox"
        onChange={(event) => {
          setNodeState((nodeState) => {
            getSelectedNode(nodeState).selectedColumnNames =
              !selectedColumnNamesSet.has(columnName)
                ? selectedColumnNamesNotNull.concat([columnName])
                : selectedColumnNamesNotNull.filter(
                    (key) => key !== columnName
                  );
          });
        }}
      />
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

function NodeUI({ node, showTools, children }) {
  const isSelected = node.selected;
  return (
    <div>
      <Box isSelected={isSelected}>{children}</Box>
      {/* <HorizontalSpace /> */}
      {/* <DeleteNodeButton node={node} /> */}
      {isSelected && showTools ? (
        <div style={{ position: "absolute", top: "110%", width: 300 }}>
          <Tools />
        </div>
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
      style={{ fontSize: 12 }}
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
  return nodeState.nodes.find((node) => node.id === id);
}

function getSource(nodeState, node) {
  return getIncomers(node, nodeState.nodes)[0];
}

function getType(node) {
  return NODE_TYPES[node.type];
}

function getQuery(nodeState, id) {
  const node = getNode(nodeState, id);
  return getType(node).query(nodeState, node);
}

function getQueryAdditionalValues(nodeState) {
  const node = getNode(nodeState, nodeState.selectedNodeID);
  return getType(node).queryAdditionalValues(nodeState, node);
}

function getColumnNames(nodeState, id) {
  const node = getNode(nodeState, id);
  return getType(node).columnNames(nodeState, node);
}

function Tools() {
  return (
    <div>
      <AttachNodeButton type="where">+WHERE</AttachNodeButton>
      <AttachNodeButton type="select">+SELECT</AttachNodeButton>
      <AttachNodeButton type="group">+GROUP BY</AttachNodeButton>
      <AttachNodeButton type="order">+ORDER BY</AttachNodeButton>
    </div>
  );
}

function AttachNodeButton({ children, type }) {
  const [, setNodeState] = useElementsContext();
  const attachNodeHandler = (type) => () => {
    setNodeState((nodeState) => {
      let { nodes } = nodeState;
      const newID = String(Math.max(...nodes.map((node) => +node.id)) + 1);
      const {
        position: { x, y },
      } = getSelectedNode(nodeState);
      nodes.push({ id: newID, type, data: {}, position: { x: x, y: y + 26 } });
      nodes.push(newEdge(nodeState.selectedNodeID, newID, true));
      // const selectedNode = getSelectedNode(nodeState);
      // if (selectedNode != null) {
      //   nodes.push(newEdge(newID, newID));
      // }
      // getOutgoers(selectedNode, nodes).forEach(child => {
      //   if (canNodeHaveManySources(child)) {

      //   }
      // });
      // nodes[nodeState.selectedNodeID].child = newID;
      nodeState.selectedNodeID = newID;
    });
  };
  return (
    <Button style={{ fontSize: 12 }} onClick={attachNodeHandler(type)}>
      {children}
    </Button>
  );
}

function newEdge(source, target, isTight) {
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

function AddNodeButton({ children, type, setNodeState }) {
  const addNodeHandler = (type) => () => {
    setNodeState((nodeState) => {
      const { nodes } = nodeState;
      const newID = Math.max(...Object.keys(nodes)) + 1;
      nodes[newID] = {
        id: newID,
        type,
      };
      nodeState.selectedNodeID = newID;
    });
  };
  return (
    <Button style={{ fontSize: 12 }} onClick={addNodeHandler(type)}>
      {children}
    </Button>
  );
}

function Box(props) {
  return (
    <div
      style={{
        cursor: "move",
        display: "inline-block",
        background: "white",
        borderRadius: 3,
        border: `1px solid ${props.isSelected ? "#0041d0" : "#1a192b"}`,
        boxShadow: props.isSelected ? "0 0 0 0.5px #0041d0" : "none",
        // borderRadius: 4,
        // boxShadow: "rgb(201 204 209) 0px 0px 0px 1px",
        // background: props.isSelected ? "#e7f2fd" : "white",
        boxSizing: "border-box",
        padding: "2px 8px",
        // margin: "0 4px 2px 0",
      }}
    >
      {props.children}
    </div>
  );
}

function Table({ nodeState, setNodeState }) {
  const [tableState, setTableState] = useState();
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (nodeState.selectedNodeID == null) {
      return;
    }
    console.log(nodeState);
    const query = getQuery(nodeState, nodeState.selectedNodeID);
    console.log(query);
    const queryAdditionalValues = getQueryAdditionalValues(nodeState);
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
                  ? getType(selectedNode).columnControl(
                      nodeState,
                      selectedNode,
                      column,
                      setNodeState
                    )
                  : null}
                {column}
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
  return getNode(nodeState, nodeState.selectedNodeID);
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
    <div style={{ display: "inline-block" }}>
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
  return <span style={{ display: "inline-block", width: 4 }}></span>;
}

function Button(props) {
  return (
    <div
      className="button"
      style={{
        ...(props.style ?? {}),
        background: "rgb(228, 230, 235)",
        display: "inline-block",
        // border: "1px solid black",
        borderRadius: 6,
        padding: "2px 4px",
        cursor: "pointer",
        margin: "0 2px 2px 0",
      }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
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
