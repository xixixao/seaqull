export function empty() {
  return { selectedColumnNames: [] };
}

export function selectedColumns(node) {
  return node.data.selectedColumnNames;
}

export function setSelectedColumns(node, columns) {
  node.data.selectedColumnNames = columns;
}
