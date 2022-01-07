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

export function removeFilter(node, column) {
  node.data.filters = filterListToString(
    filterList(node).filter((filter) => {
      const simpleJoin = getSimpleJoin(filter);
      if (simpleJoin == null) {
        return true;
      }
      const [a] = simpleJoin;
      return a !== column;
    })
  );
}

export function joinedColumns(node) {
  return filterList(node)
    .map(getSimpleJoin)
    .filter((column) => column != null);
}

function filterList(node) {
  return filters(node).split(/\s+AND\s+/);
}

function filterListToString(list) {
  return list.join(" AND ");
}

function getSimpleJoin(filter) {
  const matched = filter.match(/a\.(\w+)\s*=\s*b\.(\w+)/);
  if (matched == null) {
    return null;
  }
  const [, a, b] = matched;
  return [a, b];
}
