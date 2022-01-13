export function empty() {
  // TODO: Support arbitrary order by clauses
  return { columnToOrder: {} };
}

export function hasOrdered(node) {
  return Object.keys(node.data.columnToOrder).length > 0;
}

export function orderClause(node) {
  const columnToOrder = node.data.columnToOrder ?? {};
  return Object.keys(columnToOrder)
    .map((column) => `${column} ${columnToOrder[column]}`)
    .join(", ");
}
