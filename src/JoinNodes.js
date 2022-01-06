export function empty() {
  return { filters: "" };
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

export function addFilter(node, filter) {
  node.data.filters =
    filters(node) === "" ? filter : `${filters(node)} AND ${filter}`;
}
