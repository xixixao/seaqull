import Input from "seaqull/Input";
import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "seaqull/state";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React from "react";
import { getColumnNames, getQuerySelectable, useNodeConfig } from "../sqlNodes";
import SQLNodeUI from "../ui/SQLNodeUI";

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
  // hasProblem(appState, node) {
  //   return false; // TODO
  // },
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasFilter(node)) {
      return `SELECT * FROM (${fromQuery})`;
    }
    return `SELECT * FROM (${fromQuery}) WHERE ${nodeFilters(node)}`;
  },
  queryAdditionalValues(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasFilter(node)) {
      return null;
    }
    return `SELECT * FROM (${fromQuery}) WHERE NOT (${nodeFilters(node)})`;
  },
  queryAdditionalTables(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    return SQLWhereNodeConfig.query(appState, node);
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return getColumnNames(appState, sourceNode);
  },
  ColumnControl({ columnName }) {
    return columnName;
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
