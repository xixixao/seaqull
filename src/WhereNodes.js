export function empty(name) {
  return { filters };
}

export function filters(node) {
  return node.data.filters;
}

export function setFilters(node, filters) {
  node.data.filters = filters;
}
