import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetSelectedNodeState } from "editor/state";
import { Button } from "editor/ui/Button";
import { useEditorConfig } from "../sqliteState";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function FromNode() {
  const node = useNode();
  const name = nodeName(node);
  const setSelectedNodeState = useSetSelectedNodeState();
  return (
    <SqliteNodeUI hideControls={name.length === 0}>
      FROM{" "}
      <SqliteInput
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
  queryAdditionalTables(appState, node) {
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
  return appState.editorConfig.tableExists(nodeName(node)) != null;
}

function setName(node, name) {
  node.data.name = name;
}

function SelectTable() {
  const { schema } = useEditorConfig();
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
