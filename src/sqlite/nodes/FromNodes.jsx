import { AppStateContext, useSetSelectedNodeState } from "editor/state";
import { Button } from "editor/ui/Button";
import { useContext } from "react";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function FromNode(node) {
  const name = nodeName(node);
  const setSelectedNodeState = useSetSelectedNodeState();
  return (
    <SqliteNodeUI node={node} showTools={name?.length > 0}>
      FROM{" "}
      <SqliteInput
        node={node}
        autoFocus={true}
        value={name}
        onChange={(name) => {
          setSelectedNodeState((node) => {
            setName(node, name);
          });
        }}
      />
    </SqliteNodeUI>
  );
}

export const FromNodeConfig = {
  Component: FromNode,
  emptyNodeData: empty,
  results(appState, node) {
    return nodeName(node) === "" ? <SelectTable node={node} /> : null;
  },
  hasProblem(appState, node) {
    return nodeName(node) !== "" && !hasValidName(appState, node);
  },
  query(appState, node) {
    const name = nodeName(node);
    return name.length > 0 ? `SELECT * from ${name}` : null;
  },
  queryAdditionalValues(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    return FromNodeConfig.query(appState, node);
  },
  columnNames(appState, node) {
    return new Set(appState.editorConfig.tableColumns(nodeName(node)));
  },
  columnControl() {
    return null;
  },
};

function empty() {
  return { name: "" };
}

function nodeName(node) {
  return node.data.name;
}

function hasValidName(appState, node) {
  return appState.editorConfig.table(nodeName(node)) != null;
}

function setName(node, name) {
  node.data.name = name;
}

function SelectTable() {
  const { schema } = useContext(AppStateContext.editorConfig);
  const setSelectedNodeState = useSetSelectedNodeState();
  const tableNames = Object.keys(schema);
  tableNames.sort();
  return (
    <table>
      <thead>
        <tr>
          <th>Table</th>
          <th>Columns</th>
        </tr>
      </thead>
      <tbody>
        {tableNames.map((tableName) => (
          <tr key={tableName}>
            <td>
              <Button
                css={{ marginVert: "2px" }}
                onClick={() => {
                  setSelectedNodeState((node) => {
                    setName(node, tableName);
                  });
                }}
              >
                {tableName}
              </Button>
            </td>
            <td>{schema[tableName].join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
