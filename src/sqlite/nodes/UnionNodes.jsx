import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "editor/state";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { getColumnNames, getQuerySelectable } from "../sqliteNodes";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function UnionNode() {
  const node = useNode();
  const unionType = nodeUnionType(node);
  const setNodeState = useSetNodeState(node);
  return (
    <SqliteNodeUI>
      <SqliteInput
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
    if (isIntersect(node)) {
      return UnionNodeConfig.querySelectable(appState, node);
    }
    const parent = Arrays.first(Nodes.parents(appState, node));
    return parent != null ? getQuerySelectable(appState, parent) : null;
  },
  queryAdditionalValues(appState, node) {
    if (isIntersect(node)) {
      const parents = Nodes.parents(appState, node);
      const [a, b] = parents;
      return `SELECT * FROM (${sql(appState, "EXCEPT", a, b)})
      UNION
      SELECT * FROM (${sql(appState, "EXCEPT", b, a)})`;
    }
    const parent = Arrays.second(Nodes.parents(appState, node));
    return parent != null ? getQuerySelectable(appState, parent) : null;
  },
  querySelectable(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    return sql(appState, nodeUnionType(node), a, b);
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
  return { type: "UNION" };
}

function isIntersect(node) {
  return /^\s*intersect/i.test(nodeUnionType(node));
}

function nodeUnionType(node) {
  return node.data.type;
}

function setUnionType(node, unionType) {
  node.data.type = unionType;
}

function sql(appState, unionType, a, b) {
  return `
  ${a != null ? getQuerySelectable(appState, a) : null}
  ${unionType}
  ${b != null ? getQuerySelectable(appState, b) : null}`;
}
