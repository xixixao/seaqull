import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React from "react";
import { getQuery } from "../sqlNodes";
import SQLNodeUI from "../ui/SQLNodeUI";
import { SQLResultsChart } from "../results/SQLResultsChart";

function ChartNode() {
  // const node = useNode();
  // const filters = nodeFilters(node);
  // const setNodeState = useSetNodeState(node);
  // const orderExtensions = useNodeConfig(node).useWhereInputExtensions();
  return <SQLNodeUI parentLimit={1}>Chart</SQLNodeUI>;
}

export const SQLChartNodeConfig = {
  Component: ChartNode,
  emptyNodeData: empty,
  // hasProblem(appState, node) {
  //   return false; // TODO
  // },
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    return getQuery(appState, sourceNode);
  },
  Results: SQLResultsChart,
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
