import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React from "react";
import Input from "seaqull/Input";
import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "seaqull/state";
import { SQLResultsTableWithRemainingRows } from "../results/SQLResultsTable";
import { getColumnNames, getQuery, useNodeConfig } from "../sqlNodes";
import SQLNodeUI, { useStandardControls } from "../ui/SQLNodeUI";

function WhereNode() {
  const node = useNode();
  const filters = nodeFilters(node);
  const setNodeState = useSetNodeState(node);
  const orderExtensions = useNodeConfig(node).useWhereInputExtensions();
  return (
    <SQLNodeUI parentLimit={1}>
      WHERE{" "}
      <Input
        emptyDisplayValue="∅"
        extensions={orderExtensions}
        value={filters}
        onChange={(filters) => {
          setNodeState((node) => {
            setFilters(node, filters);
          });
        }}
      />
    </SQLNodeUI>
  );
}

export const SQLWhereNodeConfig = {
  Component: WhereNode,
  emptyNodeData: empty,
  useControls: useStandardControls,
  // hasProblem(appState, node) {
  //   return false; // TODO
  // },
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuery(appState, sourceNode);
    if (!hasFilter(node)) {
      return `SELECT * FROM (${fromQuery})`;
    }
    return `SELECT * FROM (${fromQuery}) WHERE ${nodeFilters(node)}`;
  },
  queryOtherRows(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuery(appState, sourceNode);
    if (!hasFilter(node)) {
      return null;
    }
    return `SELECT * FROM (${fromQuery}) WHERE NOT (${nodeFilters(node)})`;
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return getColumnNames(appState, sourceNode);
  },
  Results() {
    return (
      <SQLResultsTableWithRemainingRows
        getQuery={getQuery}
        getQueryForRemainingRows={SQLWhereNodeConfig.queryOtherRows}
      />
    );
  },
};

export function empty() {
  return { filters: "" };
}

export function hasFilter(node) {
  return nodeFilters(node).length > 0;
}

export function nodeFilters(node) {
  return node.data.filters;
}

export function setFilters(node, filters) {
  node.data.filters = filters;
}
