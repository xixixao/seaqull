import { DropdownMenuIcon } from "@modulz/radix-icons";
import Input from "editor/Input";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "editor/state";
import { Button } from "editor/ui/Button";
import { Column } from "editor/ui/Column";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { IconButton } from "editor/ui/IconButton";
import { Row } from "editor/ui/Row";
import ShowOnClick from "editor/ui/ShowOnClick";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { first, second } from "js/Arrays";
import * as Objects from "js/Objects";
import * as Sets from "js/Sets";
import {
  getColumnNames,
  getQuerySelectableOrNull,
  useNodeConfig,
} from "../sqlNodes";
import ColumnCheckbox from "../ui/ColumnCheckbox";
import SQLNodeUI from "../ui/SQLNodeUI";

function JoinNode() {
  const node = useNode();
  const filters = nodeFilters(node);
  const setNodeState = useSetNodeState(node);
  const typeExtensions = useNodeConfig(node).useTypeInputExtensions();
  const onExtensions = useNodeConfig(node).useOnInputExtensions();
  return (
    <SQLNodeUI parentLimit={2}>
      <Input
        emptyDisplayValue="INNER"
        extensions={typeExtensions}
        value={joinType(node)}
        onChange={(joinType) => {
          setNodeState((node) => {
            setJoinType(node, joinType);
          });
        }}
      />{" "}
      JOIN ON{" "}
      <Input
        emptyDisplayValue="∅"
        extensions={onExtensions}
        value={filters}
        onChange={(filters) => {
          setNodeState((node) => {
            setFilters(node, filters);
          });
        }}
      />
    </SQLNodeUI>
  );
}

export const SQLJoinNodeConfig = {
  Component: JoinNode,
  emptyNodeData: empty,
  hasProblem(appState, node) {
    return Nodes.parents(appState, node).length !== 2;
  },
  query(appState, node) {
    const parents = Nodes.parentsOrdered(appState, node);
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

    return sql(
      appState,
      node,
      a,
      b,
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
    );
    // validParents(appState, node)
    // return (name ?? "").length > 0 ? `SELECT * from ${name}` : null;
  },
  queryAdditionalTables(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    const parents = Nodes.parentsOrdered(appState, node);
    const [a, b] = parents;
    const parentsColumnNames = parents.map((parent) =>
      getColumnNames(appState, parent)
    );
    return sql(
      appState,
      node,
      a,
      b,
      selectedColumnExpressionsAliased(node, parentsColumnNames).join(",")
    );
  },
  columnNames(appState, node) {
    const parents = Nodes.parentsOrdered(appState, node);
    const parentsColumnNames = parents.map((parent) =>
      getColumnNames(appState, parent)
    );
    return selectedColumnNames(node, parentsColumnNames);
  },
  // TODO: Obviously refactor this
  ColumnControl({ appState, node, columnName, isPrimary, columnIndex }) {
    const setNodeState = useSetNodeState(node);
    if (Nodes.isDeleted(appState, node)) {
      return null;
    }
    const joined = joinedColumns(node);
    const parents = Nodes.parentsOrdered(appState, node);
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
                setNodeState((node) => {
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
              setNodeState((node) => {
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

function empty() {
  return { type: "INNER", where: "" };
}

function hasFilter(node) {
  return nodeFilters(node).length > 0;
}

function joinType(node) {
  return node.data.type;
}

function nodeFilters(node) {
  return node.data.where;
}

function setJoinType(node, joinType) {
  node.data.type = joinType;
}

function setFilters(node, where) {
  node.data.where = where;
}

function addFilter(node, filter) {
  setFilters(
    node,
    nodeFilters(node) === "" ? filter : `${nodeFilters(node)} AND ${filter}`
  );
}

function removeFilter(node, column) {
  setFilters(
    node,
    filterListToString(
      filterList(node).filter((filter) => {
        const simpleJoin = getSimpleJoin(filter);
        if (simpleJoin == null) {
          return true;
        }
        const [a] = simpleJoin;
        return a !== column;
      })
    )
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

function sql(appState, node, a, b, selected) {
  return `SELECT ${selected} FROM ${supportRightJoin(
    node,
    `(${getQuerySelectableOrNull(appState, a)}) AS a`,
    `(${getQuerySelectableOrNull(appState, b)}) AS b`
  )} ${hasFilter(node) ? `ON ${nodeFilters(node)}` : ""}`;
}

function supportRightJoin(node, a, b) {
  const [hasRight, operators] = convertJoinType(joinType(node));
  const [left, right] = hasRight ? [b, a] : [a, b];
  return `${left} ${operators} JOIN ${right}`;
}

function convertJoinType(joinType) {
  const operators = joinType.split(/\s+/);
  const hasRight = operators.find(isRightOperator);
  return [
    hasRight,
    operators
      .map((operator) => (isRightOperator(operator) ? "LEFT" : operator))
      .join(" "),
  ];
}

function isRightOperator(operator) {
  return /\bright\b/i.test(operator);
}

export function joinColumnsSchema(appState, node) {
  const parents = Nodes.parents(appState, node);
  return Objects.fromEntries(
    parents
      .map((parent) => getColumnNames(appState, parent))
      .map((columns, parentIndex) => [
        tableAlias(parentIndex),
        Array.from(columns),
      ])
  );
}
