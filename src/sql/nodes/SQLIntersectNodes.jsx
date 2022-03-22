import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { getColumnNames, getQuery, getQueryOrNull } from "../sqlNodes";
import SQLNodeUI, { useStandardControls } from "../ui/SQLNodeUI";
import { SQLResultsTableWithRemainingRows } from "../results/SQLResultsTable";

function IntersectNode() {
  return <SQLNodeUI parentLimit={2}>INTERSECT</SQLNodeUI>;
}

export const SQLIntersectNodeConfig = {
  Component: IntersectNode,
  emptyNodeData: empty,
  useControls: useStandardControls,
  hasProblem(appState, node) {
    return Nodes.parents(appState, node).length !== 2;
  },
  query(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    return sql(appState, "INTERSECT", a, b);
  },
  columnNames(appState, node) {
    const parent = Arrays.first(Nodes.parents(appState, node));
    if (parent == null) {
      return new Set();
    }
    return getColumnNames(appState, parent);
  },
  queryOuterRows(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    return `SELECT * FROM (${sql(appState, "EXCEPT", a, b)})
      UNION
      SELECT * FROM (${sql(appState, "EXCEPT", b, a)})`;
  },
  Results({ appState, node }) {
    return (
      <SQLResultsTableWithRemainingRows
        appState={appState}
        node={node}
        getQuery={getQuery}
        getQueryForRemainingRows={SQLIntersectNodeConfig.queryOuterRows}
      />
    );
  },
};

function empty() {
  return {};
}

function sql(appState, operator, a, b) {
  return `
  ${getQueryOrNull(appState, a)}
  ${operator}
  ${getQueryOrNull(appState, b)}`;
}
