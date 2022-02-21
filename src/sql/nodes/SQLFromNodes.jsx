import Input from "editor/Input";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "editor/state";
import { useNodeConfig } from "../sqlNodes";
import SQLNodeUI from "../ui/SQLNodeUI";

function SQLFromNode() {
  const node = useNode();
  const name = nodeName(node);
  const setNodeState = useSetNodeState(node);
  const extensions = useNodeConfig(node).useFromInputExtensions(node);
  return (
    <SQLNodeUI hideControls={name.length === 0} parentLimit={0}>
      FROM{" "}
      <Input
        autoFocus={true}
        extensions={extensions}
        value={name}
        onChange={(name) => {
          setNodeState((node) => {
            setName(node, name);
          });
        }}
      />
    </SQLNodeUI>
  );
}

export const SQLFromNodeConfig = {
  Component: SQLFromNode,
  emptyNodeData: empty,
  query(appState, node) {
    const name = nodeName(node);
    return name.length > 0 ? `SELECT * from ${name}` : null;
  },
  queryAdditionalTables(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    return SQLFromNodeConfig.query(appState, node);
  },
  ColumnControl({ columnName }) {
    return columnName;
  },
};

function empty() {
  return { name: "" };
}

export function nodeName(node) {
  return node.data.name;
}

export function setName(node, name) {
  node.data.name = name;
}
