export function empty(name) {
  return { filters };
}

export function hasFilter(node) {
  return filters(node).length > 0;
}

export function filters(node) {
  return node.data.filters;
}

export function setFilters(node, filters) {
  node.data.filters = filters;
}
