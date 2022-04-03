import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import { useAppGraphContext, useSetNodeState } from "seaqull/state";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import {
  getColumnNames,
  getQuery,
  getQueryOrNull,
  useNodeConfig,
} from "../sqlNodes";
import Input from "seaqull/Input";
import SQLNodeUI, { useStandardControls } from "../ui/SQLNodeUI";
import { SQLResultsTable } from "../results/SQLResultsTable";

function UnionNode() {
  const node = useNode();
  const unionType = nodeUnionType(node);
  const setNodeState = useSetNodeState(node);
  const typeExtensions = useNodeConfig(node).useTypeInputExtensions();
  return (
    <SQLNodeUI parentLimit={2}>
      UNION{" "}
      <Input
        emptyDisplayValue="DISTINCT"
        extensions={typeExtensions}
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
  useControls: useStandardControls,
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
  columnNames(appState, node) {
    const parent = Arrays.first(Nodes.parents(appState, node));
    if (parent == null) {
      return new Set();
    }
    return getColumnNames(appState, parent);
  },
  Results() {
    return <SQLResultsTable getQuery={getQuery} />;
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
  ${getQueryOrNull(appState, a)}
  UNION ${unionType}
  ${getQueryOrNull(appState, b)}`;
}
