import { useCallback, useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { produce, original } from "immer";

// The logical ordering would be
// FROM (foo JOIN boo ON bla)
// WHERE
// SELECT
// DISTINCT | GROUP BY
// HAVING
// ORDER
// LIMIT

function App() {
  const [namespace, setNamespace] = useState("foo_team");
  const [notebookName, setNotebookName] = useState("Untitled");

  const [nodeState, setNodeState] = useImmer({
    nodes: {
      0: { type: FromNode, id: 0, name: null },
    },
    selectedNodeID: 0,
  });

  // const [cellName, setCellName] = useState("Unnamed");

  return (
    <>
      <Input label="namespace" value={namespace} onChange={setNamespace} />
      <HorizontalSpace />
      <Input
        label="notebook name"
        value={notebookName}
        onChange={setNotebookName}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div style={{ background: "#ddd", height: "65%", padding: 4 }}>
          {nodeList(nodeState).map((node) => {
            const { Component } = node.type;
            return (
              <Component
                key={node.id}
                node={node}
                nodeState={nodeState}
                setNodeState={setNodeState}
              />
            );
          })}
        </div>
        <div style={{ padding: 8 }}>
          <Table nodeState={nodeState} setNodeState={setNodeState} />
        </div>
      </div>
    </>
  );
}

function nodeList(nodeState) {
  let parent = nodeState.nodes[0];
  const list = [parent];
  while (parent.child != null) {
    parent = nodeState.nodes[parent.child];
    list.push(parent);
  }
  return list;
}

const DeletedNode = {
  name: "DeletedNode",
  Component() {
    return null;
  },
  data(nodeState, { source }) {
    return getData(nodeState, source);
  },
  rowColumnOrdering(nodeState, { source }) {
    return getRowColumnOrdering(nodeState, source);
  },
  columnNames(nodeState, { source }) {
    return getColumnNames(nodeState, source);
  },
  availableColumnNamesSet(nodeState, { source }) {
    return new Set(getColumnNames(nodeState, source));
  },
  allColumnNames(nodeState, { source }) {
    return getAllColumnNames(nodeState, source);
  },
};

const FromNode = {
  name: "FromNode",
  Component({ node, nodeState, setNodeState, setTable }) {
    const { id, name } = node;
    const { selectedNodeID } = nodeState;
    const isSelected = id === selectedNodeID;
    return (
      <div>
        <Box isSelected={isSelected}>
          <Selectable node={node} setNodeState={setNodeState}>
            FROM{" "}
            <Input
              focused
              value={name}
              onChange={(name) => {
                setNodeState((nodeState) => {
                  nodeState.nodes[id].name = name;
                });
              }}
            />
          </Selectable>
        </Box>
        {name?.length > 0 && isSelected ? (
          <Tools selectedNodeID={selectedNodeID} setNodeState={setNodeState} />
        ) : null}
      </div>
    );
  },
  data(nodeState, { name }) {
    return (name ?? "").length > 0 ? DATA.my_table.rows : null;
  },
  rowColumnOrdering() {
    return new Map(DATA.my_table.columns.map((column, i) => [column, i]));
  },
  columnNames() {
    return DATA.my_table.columns;
  },
  availableColumnNamesSet(nodeState, node) {
    return new Set(node.type.columnNames());
  },
  allColumnNames(nodeState, node) {
    return node.type.columnNames();
  },
  columnControl() {
    return null;
  },
};

const SelectNode = {
  name: "SelectNode",
  Component({ node, nodeState, setNodeState, setTable }) {
    const { id } = node;
    const { selectedNodeID } = nodeState;
    const isSelected = id === selectedNodeID;
    const selectedColumnNames = SelectNode.columnNames(nodeState, node);
    return (
      <div>
        <Box isSelected={isSelected}>
          <Selectable node={node} setNodeState={setNodeState}>
            SELECT{" "}
            {(node.selectedColumnNames ?? []).length > 0
              ? selectedColumnNames.join(", ")
              : "*"}{" "}
          </Selectable>
          <DeleteNodeButton node={node} setNodeState={setNodeState} />
        </Box>
        {isSelected ? (
          <Tools selectedNodeID={selectedNodeID} setNodeState={setNodeState} />
        ) : null}
      </div>
    );
  },
  data(nodeState, { source }) {
    return getData(nodeState, source);
  },
  rowColumnOrdering(nodeState, { source }) {
    return getRowColumnOrdering(nodeState, source);
  },
  columnNames(nodeState, node) {
    const { selectedColumnNames } = node;
    const selectedColumnNamesNotNull = selectedColumnNames ?? [];
    const availableColumnNamesSet = SelectNode.availableColumnNamesSet(
      nodeState,
      node
    );
    return selectedColumnNamesNotNull.length === 0
      ? getColumnNames(nodeState, node.source)
      : selectedColumnNamesNotNull.filter((columnName) =>
          availableColumnNamesSet.has(columnName)
        );
  },
  availableColumnNamesSet(nodeState, { source }) {
    return new Set(getColumnNames(nodeState, source));
  },
  allColumnNames(nodeState, node) {
    const selectedColumnNames = SelectNode.columnNames(nodeState, node);
    const selectedColumnNamesSet = new Set(selectedColumnNames);
    return selectedColumnNames.concat(
      getAllColumnNames(nodeState, node.source).filter(
        (column) => !selectedColumnNamesSet.has(column)
      )
    );
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

const WhereNode = {
  name: "WhereNode",
  Component({ node, nodeState, setNodeState, setTable }) {
    const { selectedNodeID } = nodeState;
    const { id, filters } = node;
    const isSelected = id === selectedNodeID;
    return (
      <div>
        <Box isSelected={isSelected}>
          <Selectable node={node} setNodeState={setNodeState}>
            WHERE {"id > 4 AND dau = 0"}
          </Selectable>{" "}
          <DeleteNodeButton node={node} setNodeState={setNodeState} />
        </Box>
        {isSelected ? (
          <Tools selectedNodeID={selectedNodeID} setNodeState={setNodeState} />
        ) : null}
      </div>
    );
  },
  data(nodeState, { source }) {
    return getData(nodeState, source).filter((row) => row[1] > 4);
  },
  rowColumnOrdering(nodeState, { source }) {
    return getRowColumnOrdering(nodeState, source);
  },
  columnNames(nodeState, { source }) {
    return getColumnNames(nodeState, source);
  },
  availableColumnNamesSet(nodeState, { source }) {
    return new Set(getColumnNames(nodeState, source));
  },
  allColumnNames(nodeState, { source }) {
    return getAllColumnNames(nodeState, source);
  },
  columnControl() {
    return null;
  },
};

function GroupNodeComponent({ node, nodeState, setNodeState, setTable }) {
  const { id } = node;
  const { selectedNodeID } = nodeState;
  const isSelected = id === selectedNodeID;
  const selectedColumnNames = SelectNode.columnNames(nodeState, node);
  return (
    <div>
      <Box isSelected={isSelected}>
        <Selectable node={node} setNodeState={setNodeState}>
          GROUP BY{" "}
          {(node.selectedColumnNames ?? []).length > 0
            ? selectedColumnNames.join(", ")
            : "∅"}{" "}
        </Selectable>
        <DeleteNodeButton node={node} setNodeState={setNodeState} />
      </Box>
      {isSelected ? (
        <Tools selectedNodeID={selectedNodeID} setNodeState={setNodeState} />
      ) : null}
    </div>
  );
}

const GroupNode = {
  Component: GroupNodeComponent,
  data(nodeState, node) {
    const rows = getData(nodeState, node.source);
    const selectedColumnNames = node.selectedColumnNames ?? [];
    const rowColumnOrdering = getRowColumnOrdering(nodeState, node.source);
    const uniqueValues = new Map(
      selectedColumnNames.map((column) => {
        const i = rowColumnOrdering.get(column);
        return [i, Array.from(new Set(rows.map((row) => row[i])))];
      })
    );
    console.log(uniqueValues);
    return produce(rows, (rows) => {
      rows.forEach((row, j) => {
        row.forEach((_, i) => {
          if (uniqueValues.has(i)) {
            row[i] = uniqueValues.get(i)[j];
          }
        });
      });
    });
  },
  rowColumnOrdering(nodeState, { source }) {
    return getRowColumnOrdering(nodeState, source);
  },
  columnNames(nodeState, node) {
    const { selectedColumnNames } = node;
    const selectedColumnNamesNotNull = selectedColumnNames ?? [];
    const availableColumnNamesSet = SelectNode.availableColumnNamesSet(
      nodeState,
      node
    );
    return selectedColumnNamesNotNull.length === 0
      ? getColumnNames(nodeState, node.source)
      : selectedColumnNamesNotNull.filter((columnName) =>
          availableColumnNamesSet.has(columnName)
        );
  },
  availableColumnNamesSet(nodeState, { source }) {
    return new Set(getColumnNames(nodeState, source));
  },
  allColumnNames(nodeState, node) {
    const selectedColumnNames = SelectNode.columnNames(nodeState, node);
    const selectedColumnNamesSet = new Set(selectedColumnNames);
    return selectedColumnNames.concat(
      getAllColumnNames(nodeState, node.source).filter(
        (column) => !selectedColumnNamesSet.has(column)
      )
    );
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
  Component({ node, nodeState, setNodeState, setTable }) {
    const { id } = node;
    const { selectedNodeID } = nodeState;
    const isSelected = id === selectedNodeID;
    const columnToOrder = node.columnToOrder ?? {};
    const ascColumns = Object.keys(columnToOrder).filter(
      (column) => columnToOrder[column] === "ASC"
    );
    const descColumns = Object.keys(columnToOrder).filter(
      (column) => columnToOrder[column] === "DESC"
    );
    const ascClause =
      ascColumns.length > 0 ? " " + ascColumns.join(", ") + " ASC" : null;
    const descClause =
      descColumns.length > 0
        ? (ascClause != null ? "," : "") +
          " " +
          descColumns.join(", ") +
          " DESC"
        : null;
    return (
      <div>
        <Box isSelected={isSelected}>
          <Selectable node={node} setNodeState={setNodeState}>
            ORDER BY
            {ascClause}
            {descClause}
            {ascClause == null && descClause == null ? "∅" : ""}{" "}
          </Selectable>
          <DeleteNodeButton node={node} setNodeState={setNodeState} />
        </Box>
        {isSelected ? (
          <Tools selectedNodeID={selectedNodeID} setNodeState={setNodeState} />
        ) : null}
      </div>
    );
  },
  data(nodeState, { source, columnToOrder }) {
    const rowColumnOrdering = getRowColumnOrdering(nodeState, source);
    const orderColumn = Array.from(Object.keys(columnToOrder ?? {}))[0];
    const rows = getData(nodeState, source);
    if (orderColumn == null) {
      return rows;
    }
    const i = rowColumnOrdering.get(orderColumn);
    const isAsc = columnToOrder[orderColumn] === "ASC" ? 1 : -1;
    return produce(rows, (rows) => {
      rows.sort((rowA, rowB) => isAsc * (rowA[i] - rowB[i]));
    });
  },
  rowColumnOrdering(nodeState, { source }) {
    return getRowColumnOrdering(nodeState, source);
  },
  columnNames(nodeState, { source }) {
    return getColumnNames(nodeState, source);
  },
  availableColumnNamesSet(nodeState, { source }) {
    return new Set(getColumnNames(nodeState, source));
  },
  allColumnNames(nodeState, { source }) {
    return getAllColumnNames(nodeState, source);
  },
  columnControl(nodeState, node, columnName, setNodeState) {
    const selectableColumnNames = getColumnNames(nodeState, node.source);
    // TODO: Fix O(N^2) algo to be nlogn
    if (!selectableColumnNames.find((column) => column === columnName)) {
      return null;
    }
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

function Selectable({ node, children, setNodeState }) {
  return (
    <span
      onClick={() => {
        setNodeState((nodeState) => {
          nodeState.selectedNodeID = node.id;
        });
      }}
    >
      {children}
    </span>
  );
}

function DeleteNodeButton({ node: { id, source }, setNodeState }) {
  return (
    <Button
      onClick={() => {
        setNodeState((nodeState) => {
          nodeState.nodes[id].type = DeletedNode;
          if (nodeState.selectedNodeID === id) {
            nodeState.selectedNodeID = getUndeletedSource(
              original(nodeState.nodes),
              nodeState.nodes[id]
            );
          }
        });
      }}
    >
      🗑
    </Button>
  );
}

function getUndeletedSource(nodes, node) {
  if (node.type === DeletedNode) {
    return getUndeletedSource(nodes, nodes[node.source]);
  }
  return node.id;
}

function getData(nodeState, id) {
  const node = nodeState.nodes[id];
  return node.type.data(nodeState, node);
}

function getRowColumnOrdering(nodeState, id) {
  const node = nodeState.nodes[id];
  return node.type.rowColumnOrdering(nodeState, node);
}

function getColumnNames(nodeState, id) {
  const node = nodeState.nodes[id];
  return node.type.columnNames(nodeState, node);
}
function getAvailableColumnNamesSet(nodeState, id) {
  const node = nodeState.nodes[id];
  return node.type.availableColumnNamesSet(nodeState, node);
}
function getAllColumnNames(nodeState, id) {
  const node = nodeState.nodes[id];
  return node.type.allColumnNames(nodeState, node);
}

function Tools({ setNodeState }) {
  const addNodeHandler = (type) => () => {
    setNodeState((nodeState) => {
      const { nodes } = nodeState;
      const newID = Math.max(...Object.keys(nodes)) + 1;
      nodes[newID] = {
        id: newID,
        type,
        source: nodeState.selectedNodeID,
        child: nodes[nodeState.selectedNodeID].child,
      };
      nodes[nodeState.selectedNodeID].child = newID;
      nodeState.selectedNodeID = newID;
    });
  };
  return (
    <div style={{ fontSize: 12 }}>
      <Button onClick={addNodeHandler(WhereNode)}>+WHERE</Button>
      <Button onClick={addNodeHandler(SelectNode)}>+SELECT</Button>
      <Button onClick={addNodeHandler(GroupNode)}>+GROUP BY</Button>
      <Button onClick={addNodeHandler(OrderNode)}>+ORDER BY</Button>
    </div>
  );
}

function Box(props) {
  return (
    <div
      style={{
        display: "inline-block",
        border: `${props.isSelected ? 3 : 1}px solid ${
          props.isSelected ? "#cf0" : "black"
        }`,
        padding: props.isSelected ? 1 : 3,
        background: "white",
      }}
    >
      {props.children}
    </div>
  );
}

function ColumnSelector() {
  const [/* shown, */ setShown] = useState(false);

  return (
    <span style={{ cursor: "pointer" }} onClick={() => setShown(true)}>
      <Button>∇</Button>
    </span>
  );
}

function Table({ nodeState, setNodeState }) {
  const [rows, setRows] = useState();
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const data = getData(nodeState, nodeState.selectedNodeID);
    if (data != null) {
      setIsLoading(true);
    }
    setTimeout(() => {
      setIsLoading(false);
      setUpdated(true);
      setRows(data);
      setTimeout(() => setUpdated(false), 1000);
    }, 300);
  }, [nodeState]);

  if (isLoading && rows == null) {
    return <div style={{ padding: 12 }}>Loading...</div>;
  } else if (rows == null) {
    return null;
  }
  const { selectedNodeID } = nodeState;
  const availableColumnNamesSet = getAvailableColumnNamesSet(
    nodeState,
    selectedNodeID
  );
  const rowColumnOrdering = getRowColumnOrdering(nodeState, selectedNodeID);
  const columnNames = getAllColumnNames(nodeState, selectedNodeID);
  const selectedNode = getSelectedNode(nodeState);
  const isSelect = selectedNode.type === SelectNode;
  return (
    <>
      <table className={updated ? "updated" : null}>
        <thead>
          <tr>
            {isSelect ? (
              <th>
                <ColumnSelector />
              </th>
            ) : null}
            {columnNames.map((column) => (
              <th
                key={column}
                style={{
                  textAlign: "start",
                  color: availableColumnNamesSet.has(column) ? "black" : "#ddd",
                }}
              >
                {selectedNode.type.columnControl(
                  nodeState,
                  selectedNode,
                  column,
                  setNodeState
                )}
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {isSelect ? <td></td> : null}
              {columnNames.map((column) => (
                <td key={column}>{row[rowColumnOrdering.get(column)]}</td>
              ))}
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
  return nodeState.nodes[nodeState.selectedNodeID];
}

function Input(props) {
  const [edited, setEdited] = useState(props.focused || false);
  const [defaultValue] = useState(props.value);
  const { value, onChange: setValue } = props;
  const inputRef = useRef();
  useEffect(() => {
    if (edited && !inputRef.current.focused) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [edited]);
  const handleReset = useCallback(() => {
    if (value === "" || value == null) {
      if (defaultValue != null) {
        setValue(defaultValue);
      } else {
        return;
      }
    }
    setEdited(false);
  }, [defaultValue, value, setValue]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (edited && !inputRef.current.contains(event.target)) {
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
      {props.label != null ? <Label>{props.label}</Label> : null}
      {edited ? (
        <input
          ref={inputRef}
          style={{ display: "block" }}
          type="text"
          value={value || ""}
          onMouseLeave={handleReset}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div style={{ cursor: "pointer" }} onClick={() => setEdited(true)}>
          {value}
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
        background: "white",
        display: "inline-block",
        border: "1px solid black",
        borderRadius: 4,
        padding: "0 2px",
        cursor: "pointer",
      }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}

const DATA = {
  my_table: {
    columns: ["ds", "id", "name", "dau", "wau", "country", "metadata"],
    // prettier-ignore
    rows: [
["2042-02-03", 9, 'John', 1, 0, 'UK', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-03", 4, 'Bob', 0, 0, 'CZ', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-03", 12, 'Ross', 1, 0, 'FR', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-01", 1, 'Marline', 1, 1, 'US', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-01", 14, 'Jackie', 1, 0, 'BU', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-04", 11, 'Major', 0, 0, 'IS', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-04", 2, 'Smith', 0, 0, 'LI', "{foo: 'bar', bee: 'ba', do: 'da'}"],
["2042-02-03", 16, 'Capic', 1, 0, 'LA', "{foo: 'bar', bee: 'ba', do: 'da'}"],
    ],
  },
};

// const TABLES = [
//   { value: "chocolate", label: "Chocolate" },
//   { value: "strawberry", label: "Strawberry" },
//   { value: "vanilla", label: "Vanilla" },
// ];

export default App;
