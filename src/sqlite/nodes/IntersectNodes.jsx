import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { getColumnNames, getQuerySelectableOrNull } from "../sqliteNodes";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function IntersectNode() {
  return <SqliteNodeUI>INTERSECT</SqliteNodeUI>;
}

export const IntersectNodeConfig = {
  Component: IntersectNode,
  emptyNodeData: empty,
  hasProblem(appState, node) {
    return Nodes.parents(appState, node).length !== 2;
  },
  query(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    return sql(appState, a, b);
  },
  querySelectable(appState, node) {
    return IntersectNodeConfig.query(appState, node);
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
  return {};
}

function sql(appState, a, b) {
  return `
  ${getQuerySelectableOrNull(appState, a)}
  INTERSECT
  ${getQuerySelectableOrNull(appState, b)}`;
}
