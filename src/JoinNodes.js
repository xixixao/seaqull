import * as Sets from "./Sets";
import * as Arrays from "./Arrays";

export function empty(filters = "") {
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

export function selectedColumnExpressionsAliased(node, parentsColumnNames) {
  const joined = joinedColumns(node);
  const otherParentColumns = parentsColumnNames.map(
    (columnNames, parentIndex) =>
      Sets.subtract(
        columnNames,
        new Set(joined.map((pair) => pair[parentIndex]))
      )
  );

  return joined
    .map(Arrays.first)
    .map((column) => prefixed(0, column))
    .concat(
      ...otherParentColumns.map((columnNames, parentIndex) =>
        Arrays.map(
          columnNames,
          (column) =>
            `${prefixed(parentIndex, column)}${
              otherParentColumns[otherParent(parentIndex)].has(column)
                ? ` as ${alias(parentIndex, column)}`
                : ""
            }`
        )
      )
    );
}

export function selectedColumnNames(node, parentsColumnNames) {
  const joined = joinedColumns(node);
  const otherParentColumns = parentsColumnNames.map(
    (columnNames, parentIndex) =>
      Sets.subtract(
        columnNames,
        new Set(joined.map((pair) => pair[parentIndex]))
      )
  );

  return new Set(
    joined
      .map(Arrays.first)
      .concat(
        ...otherParentColumns.map((columnNames, parentIndex) =>
          Arrays.map(columnNames, (column) =>
            otherParentColumns[otherParent(parentIndex)].has(column)
              ? alias(parentIndex, column)
              : column
          )
        )
      )
  );
}

export function prefixed(index, columnName) {
  return `${tableAlias(index)}.${columnName}`;
}

export function alias(index, columnName) {
  return `${columnName}_${tableAlias(index)}`;
}

export function tableAlias(index) {
  return index === 0 ? "a" : "b";
}

function otherParent(index) {
  return index === 0 ? 1 : 0;
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
