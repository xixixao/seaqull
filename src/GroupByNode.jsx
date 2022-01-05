export const AGGREGATIONS = {
  "COUNT DISTINCT": (column) => `COUNT(DISTINCT ${column})`,
  AVG: (column) => `AVG(${column})`,
  MIN: (column) => `MIN(${column})`,
  MAX: (column) => `MAX(${column})`,
};

export function empty() {
  return { groupedColumns: new Set(), aggregations: [] };
}

export function groupedColumns(node) {
  return node.data.groupedColumns;
}

export function hasGroupedColumn(node, column) {
  return node.data.groupedColumns.has(column);
}

export function aggregations(node) {
  return node.data.aggregations;
}

// TODO: allow unselecting groupedColumns
export function selectedColumnExpressions(node) {
  const grouped = groupedColumns(node);
  const aggregatedColumns = aggregations(node).map(aggregateExpression);
  return Array.from(grouped).concat(aggregatedColumns);
}

export function selectedColumnExpressionsAliased(node) {
  const grouped = groupedColumns(node);
  const aggregatedColumns = aggregations(node).map(
    (columnAndAggregation) =>
      `${aggregateExpression(columnAndAggregation)} as ${aggregationAlias(
        columnAndAggregation
      )}`
  );
  return Array.from(grouped).concat(aggregatedColumns);
}

export function selectedColumns(node) {
  const grouped = groupedColumns(node);
  const aggregatedColumns = aggregations(node).map(aggregationAlias);
  return new Set(Array.from(grouped).concat(aggregatedColumns));
}

function aggregateExpression([columnName, aggregation]) {
  return AGGREGATIONS[aggregation](columnName);
}

function aggregationAlias([columnName, aggregation]) {
  return `${aggregation.toLowerCase().split(/\s+/).join("_")}_${columnName}`;
}

export function addAggregation(node, columnName, aggregation) {
  node.data.aggregations.push([columnName, aggregation]);
}

export function toggleGroupedColumn(node, columnName) {
  const columns = groupedColumns(node);
  if (columns.has(columnName)) {
    columns.delete(columnName);
  } else {
    columns.add(columnName);
  }
}

export function sql(node, selectExpressions, fromQuery) {
  return `SELECT ${selectExpressions.join(", ")}
  FROM (${fromQuery})
  GROUP BY ${groupedColumns(node).join(", ")}`;
}
