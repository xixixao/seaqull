import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React from "react";
import { getQuery } from "../sqlNodes";
import SQLNodeUI from "../ui/SQLNodeUI";
import { SQLResultsChart } from "../results/SQLResultsChart";

function ChartNode() {
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
  return {};
}
