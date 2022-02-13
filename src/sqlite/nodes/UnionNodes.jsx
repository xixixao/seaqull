import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "editor/state";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { getColumnNames, getQuerySelectableOrNull } from "../sqliteNodes";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function UnionNode() {
  const node = useNode();
  const unionType = nodeUnionType(node);
  const setNodeState = useSetNodeState(node);
  return (
    <SqliteNodeUI>
      UNION{" "}
      <SqliteInput
        emptyDisplayValue="DISTINCT"
        value={unionType}
        onChange={(unionType) => {
          setNodeState((node) => {
            setUnionType(node, unionType);
          });
        }}
      />
    </SqliteNodeUI>
  );
}

export const UnionNodeConfig = {
  Component: UnionNode,
  emptyNodeData: empty,
  hasProblem(appState, node) {
    return Nodes.parents(appState, node).length !== 2;
  },
  query(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    return sql(appState, nodeUnionType(node), a, b);
  },
  querySelectable(appState, node) {
    return UnionNodeConfig.query(appState, node);
  },
  columnNames(appState, node) {
    const parent = Arrays.first(Nodes.parents(appState, node));
    if (parent == null) {
      return new Set();
    }
    return getColumnNames(appState, parent);
  },
  ColumnControl({ columnName }) {
    return columnName;
  },
};

function empty() {
  return { type: "" };
}

function nodeUnionType(node) {
  return node.data.type;
}

function setUnionType(node, unionType) {
  node.data.type = unionType;
}

function sql(appState, unionType, a, b) {
  return `
  ${getQuerySelectableOrNull(appState, a)}
  UNION ${unionType}
  ${getQuerySelectableOrNull(appState, b)}`;
}
