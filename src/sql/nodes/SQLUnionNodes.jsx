import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useAppGraphContext, useSetNodeState } from "editor/state";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { getColumnNames, getQuerySelectableOrNull } from "../sqlNodes";
import Input from "editor/Input";
import SQLNodeUI from "../ui/SQLNodeUI";

function UnionNode() {
  const node = useNode();
  const unionType = nodeUnionType(node);
  const setNodeState = useSetNodeState(node);
  return (
    <SQLNodeUI parentLimit={2}>
      UNION{" "}
      <Input
        emptyDisplayValue="DISTINCT"
        value={unionType}
        onChange={(unionType) => {
          setNodeState((node) => {
            setUnionType(node, unionType);
          });
        }}
      />
    </SQLNodeUI>
  );
}

export const SQLUnionNodeConfig = {
  Component: UnionNode,
  emptyNodeData: empty,
  useHasProblem() {
    const appState = useAppGraphContext();
    const node = useNode();
    return Nodes.parents(appState, node).length !== 2;
  },
  query(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    return sql(appState, nodeUnionType(node), a, b);
  },
  querySelectable(appState, node) {
    return SQLUnionNodeConfig.query(appState, node);
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
