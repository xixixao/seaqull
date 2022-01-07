export function empty() {
  return { selected: [] };
}

export function selectedExpressions(node) {
  return node.data.selected;
}

export function selectedExpressionsAliased(node) {
  return selectedExpressions(node).map((expression) =>
    !isColumnName(expression) && !hasAlias(expression)
      ? `${expression} as ${alias(expression)}`
      : expression
  );
}

export function selectedColumns(node) {
  return new Set(
    selectedExpressions(node).map((expression) =>
      !isColumnName(expression) && !hasAlias(expression)
        ? alias(expression)
        : hasAlias(expression)
        ? getAlias(expression)
        : expression
    )
  );
}

function isColumnName(expression) {
  return /^\w+$/.test(expression);
}

function hasAlias(expression) {
  return /as\s+\w+$/i.test(expression);
}

function alias(expression) {
  return expression.replace(/(\W|\s)+/g, "_");
}

function getAlias(expression) {
  return expression.replace(/^.*as\s+(\w+)$/g, "$1");
}

export function hasSelected(node, column) {
  return selectedExpressions(node).length > 0;
}

export function hasSelectedColumn(node, column) {
  return new Set(selectedExpressions(node)).has(column);
}

export function setSelectedExpressions(node, expressions) {
  node.data.selected = expressions;
}

export function toggleSelectedColumn(node, columnName) {
  const selected = selectedExpressions(node);
  node.data.selected = !hasSelectedColumn(node, columnName)
    ? selected.concat([columnName])
    : selected.filter((key) => key !== columnName);
}
