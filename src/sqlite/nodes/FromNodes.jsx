import Input from "editor/Input";
import SqliteNodeUI from "../ui/SqliteNodeUI";
import { useSetSelectedNodeState } from "editor/state";

function FromNode(node) {
  const name = nodeName(node);
  const setSelectedNodeState = useSetSelectedNodeState();
  return (
    <SqliteNodeUI node={node} showTools={name?.length > 0}>
      FROM{" "}
      <Input
        focused={name == null}
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
  hasProblem(appState, node) {
    return !hasValidName(appState, node);
  },
  query(appState, node) {
    const name = nodeName(node);
    return (name ?? "").length > 0 ? `SELECT * from ${name}` : null;
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
  return { name: null };
}

function nodeName(node) {
  return node.data.name;
}

function hasValidName(appState, node) {
  return appState.editorConfig.table(nodeName(node) ?? "") != null;
}

function setName(node, name) {
  node.data.name = name;
}
