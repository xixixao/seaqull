import { DropdownMenuIcon } from "@modulz/radix-icons";
import { useSetSelectedNodeState } from "editor/state";
import { Button } from "editor/ui/Button";
import { Column } from "editor/ui/Column";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { IconButton } from "editor/ui/IconButton";
import { Row } from "editor/ui/Row";
import ShowOnClick from "editor/ui/ShowOnClick";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { first, second } from "js/Arrays";
import * as Sets from "js/Sets";
import { getColumnNames, getQuerySelectable } from "../sqliteNodes";
import ColumnCheckbox from "../ui/ColumnCheckbox";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function JoinNode(node) {
  const filters = nodeFilters(node);
  const setSelectedNodeState = useSetSelectedNodeState();
  return (
    <SqliteNodeUI node={node}>
      {/* todo type of join */}
      JOIN ON{" "}
      <SqliteInput
        node={node}
        displayValue={!hasFilter(node) ? "∅" : null}
        value={filters}
        onChange={(filters) => {
          setSelectedNodeState((node) => {
            setFilters(node, filters);
          });
        }}
      />
    </SqliteNodeUI>
  );
}

export const JoinNodeConfig = {
  Component: JoinNode,
  emptyNodeData: empty,
  hasProblem(appState, node) {
    return Nodes.parents(appState, node).length !== 2;
  },
  query(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    const joined = joinedColumns(node);
    const aOtherColumns = Arrays.subtractSets(
      a != null ? getColumnNames(appState, a) : new Set(),
      // TODO: Fix this logic
      new Set(joined.map(first))
    );
    const bOtherColumns = Arrays.subtractSets(
      b != null ? getColumnNames(appState, b) : new Set(),
      // TODO: Fix this logic
      new Set(joined.map(second))
    );

    return `SELECT ${
      joined.length > 0
        ? joined
            .map(first)
            .map((column) => "a." + column)
            .concat(
              aOtherColumns.map((column) => "a." + column),
              bOtherColumns.map((column) => "b." + column)
            )
            .join(",")
        : "a.*, b.*"
    } FROM (${a != null ? getQuerySelectable(appState, a) : null}) AS a
    JOIN (${b != null ? getQuerySelectable(appState, b) : null}) AS b ${
      hasFilter(node) ? `ON ${nodeFilters(node)}` : ""
    }`;
    // validParents(appState, node)
    // return (name ?? "").length > 0 ? `SELECT * from ${name}` : null;
  },
  queryAdditionalValues(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    const parents = Nodes.parents(appState, node);
    const [a, b] = parents;
    const parentsColumnNames = parents.map((parent) =>
      getColumnNames(appState, parent)
    );
    return `SELECT ${selectedColumnExpressionsAliased(
      node,
      parentsColumnNames
    ).join(",")} FROM (${
      a != null ? getQuerySelectable(appState, a) : null
    }) AS a
    JOIN (${b != null ? getQuerySelectable(appState, b) : null}) AS b ${
      hasFilter(node) ? `ON ${nodeFilters(node)}` : ""
    }`;
  },
  columnNames(appState, node) {
    const parents = Nodes.parents(appState, node);
    const parentsColumnNames = parents.map((parent) =>
      getColumnNames(appState, parent)
    );
    return selectedColumnNames(node, parentsColumnNames);
  },
  // TODO: Obviously refactor this
  columnControl(
    appState,
    node,
    columnName,
    setSelectedNodeState,
    isPrimary,
    columnIndex
  ) {
    const joined = joinedColumns(node);
    const parents = Nodes.parents(appState, node);
    const aOtherColumns = Arrays.subtractSets(
      getColumnNames(appState, first(parents)),
      // TODO: Fix this logic
      new Set(joined.map(first))
    );
    const isJoined = columnIndex < joined.length;
    const isA = columnIndex < joined.length + aOtherColumns.length;
    const prefixedColumnName =
      (isJoined ? "" : (isA ? "a" : "b") + ".") + columnName;
    return (
      <Row align="center">
        {isJoined ? (
          <>
            <ColumnCheckbox
              checked={true}
              onChange={() => {
                setSelectedNodeState((node) => {
                  removeFilter(node, columnName);
                });
              }}
            />
            <HorizontalSpace />
            <HorizontalSpace />
          </>
        ) : null}
        {prefixedColumnName}
        {!isJoined ? (
          <JoinOnSelector
            columns={Arrays.map(
              getColumnNames(
                appState,
                (isA ? second : first)(Nodes.parents(appState, node))
              ),
              (column) => (!isA ? "a" : "b") + "." + column
            )}
            onChange={(otherColumn) => {
              setSelectedNodeState((node) => {
                addFilter(node, `${prefixedColumnName} = ${otherColumn}`);
              });
            }}
          />
        ) : null}
      </Row>
    );
  },
};

function JoinOnSelector({ columns, onChange }) {
  return (
    <ShowOnClick
      css={{
        position: "absolute",
        top: "100%",
        background: "$slate7",
        padding: "$4",
        borderRadius: "$4",
      }}
      trigger={
        <IconButton>
          <DropdownMenuIcon />
        </IconButton>
      }
    >
      <Column>
        {columns.map((column) => (
          <Button
            css={{ marginTop: "$4" }}
            key={column}
            onClick={() => onChange(column)}
          >
            {column}
          </Button>
        ))}
      </Column>
    </ShowOnClick>
  );
}

function empty(filters = "") {
  return { filters };
}

function hasFilter(node) {
  return nodeFilters(node).length > 0;
}

function nodeFilters(node) {
  return node.data.filters;
}

function setFilters(node, filters) {
  node.data.filters = filters;
}

function addFilter(node, filter) {
  node.data.filters =
    nodeFilters(node) === "" ? filter : `${nodeFilters(node)} AND ${filter}`;
}

function removeFilter(node, column) {
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

function selectedColumnExpressionsAliased(node, parentsColumnNames) {
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
              (otherParentColumns[otherParent(parentIndex)] ?? new Set()).has(
                column
              )
                ? ` as ${alias(parentIndex, column)}`
                : ""
            }`
        )
      )
    );
}

function selectedColumnNames(node, parentsColumnNames) {
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
            (otherParentColumns[otherParent(parentIndex)] ?? new Set()).has(
              column
            )
              ? alias(parentIndex, column)
              : column
          )
        )
      )
  );
}

function prefixed(index, columnName) {
  return `${tableAlias(index)}.${columnName}`;
}

function alias(index, columnName) {
  return `${columnName}_${tableAlias(index)}`;
}

function tableAlias(index) {
  return index === 0 ? "a" : "b";
}

function otherParent(index) {
  return index === 0 ? 1 : 0;
}

function joinedColumns(node) {
  return filterList(node)
    .map(getSimpleJoin)
    .filter((column) => column != null);
}

function filterList(node) {
  return nodeFilters(node).split(/\s+AND\s+/);
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
