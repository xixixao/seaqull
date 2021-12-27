import * as Arrays from "./Arrays";

export const AGGREGATIONS = {
  "COUNT DISTINCT": (column) => `COUNT(DISTINCT ${column})`,
  AVG: (column) => `AVG(${column})`,
  MIN: (column) => `MIN(${column})`,
  MAX: (column) => `MAX(${column})`,
};

export function empty() {
  return { selectedColumnNames: [], aggregations: [] };
}

export function groupedColumns(node) {
  return node.data.selectedColumnNames;
}

export function aggregations(node) {
  return node.data.aggregations;
}

// TODO: allow unselecting groupedColumns
export function selectedColumns(node) {
  const grouped = groupedColumns(node);
  const aggregatedColumns = Arrays.map(
    aggregations(node),
    ([columnName, aggregation]) => AGGREGATIONS[aggregation](columnName)
  );
  return grouped.concat(aggregatedColumns);
}

export function addAggregation(node, columnName, aggregation) {
  node.data.aggregations.push([columnName, aggregation]);
}
