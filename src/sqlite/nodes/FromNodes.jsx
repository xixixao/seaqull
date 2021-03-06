import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "seaqull/state";
import { Button } from "ui/interactive/Button";
import {
  nodeName,
  setName,
  SQLFromNodeConfig,
} from "../../sql/nodes/SQLFromNodes";
import { useSQLResultsNodeContext } from "../../sql/results/SQLResults";
import { SQLResultsTableOrQuery } from "../../sql/results/SQLResultsTable";
import { getQuery } from "../../sql/sqlNodes";
import { useEditorConfig } from "../sqliteState";
import { sqlite } from "./sqliteCompletions";

export const FromNodeConfig = {
  ...SQLFromNodeConfig,
  useHasProblem() {
    const editorConfig = useEditorConfig();
    const node = useNode();
    return nodeName(node) !== "" && !hasValidName({ editorConfig }, node);
  },
  useFromInputExtensions() {
    const { schema } = useEditorConfig();
    return sqlite(schema);
  },
  columnNames(appState, node) {
    return new Set(appState.editorConfig.tableColumns(nodeName(node)));
  },
  Results() {
    const { appState, node } = useSQLResultsNodeContext();
    if (nodeName(node) === "") {
      if (!isOnlySelected(appState, node)) {
        return null;
      }
      return <SelectTable node={node} />;
    }
    return <SQLResultsTableOrQuery getQuery={getQuery} />;
  },
};

function isOnlySelected(appState, node) {
  const selected = only(Nodes.selected(appState));
  if (selected == null) {
    return false;
  }
  return Node.is(selected, node);
}

function hasValidName(appState, node) {
  return appState.editorConfig.tableExists(nodeName(node)) != null;
}

function SelectTable() {
  const { node } = useSQLResultsNodeContext();
  const { schema } = useEditorConfig();
  const setNodeState = useSetNodeState(node);
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
                  setNodeState((node) => {
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
