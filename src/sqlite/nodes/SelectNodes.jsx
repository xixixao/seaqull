import { useSetSelectedNodeState } from "editor/state";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Row } from "editor/ui/Row";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";
import React from "react";
import {
  getColumnNames,
  getQuerySelectable,
  someOrAllColumnList,
} from "../sqliteNodes";
import ColumnCheckbox from "../ui/ColumnCheckbox";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function SelectNode(node) {
  const setSelectedNodeState = useSetSelectedNodeState();
  return (
    <SqliteNodeUI node={node}>
      SELECT{" "}
      <SqliteInput
        value={someOrAllColumnList(selectedExpressions(node))}
        onChange={(expressions) => {
          setSelectedNodeState((node) => {
            setSelectedExpressions(
              node,
              "*" === expressions ? [] : expressions.split(/, */)
            );
          });
        }}
      />
    </SqliteNodeUI>
  );
}

export const SelectNodeConfig = {
  Component: SelectNode,
  emptyNodeData: empty,
  hasProblem(appState, node) {
    return only(Nodes.parents(appState, node)) == null;
  },
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery =
      sourceNode == null ? null : getQuerySelectable(appState, sourceNode);
    return `SELECT ${someOrAllColumnList(
      selectedExpressions(node)
    )} FROM (${fromQuery})`;
  },
  queryAdditionalValues(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    const expressions = selectedExpressions(node);
    if (expressions.length === 0) {
      return null;
    }
    const otherColumns = Arrays.subtractSets(
      getColumnNames(appState, sourceNode),
      // TODO: Fix this logic
      new Set(expressions)
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  querySelectable(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery =
      sourceNode == null ? null : getQuerySelectable(appState, sourceNode);
    return `SELECT ${someOrAllColumnList(
      selectedExpressionsAliased(node)
    )} FROM (${fromQuery})`;
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    const expressions = selectedExpressions(node);
    return expressions.length > 0
      ? selectedColumns(node)
      : getColumnNames(appState, sourceNode);
  },
  columnControl(appState, node, columnName, setSelectedNodeState) {
    return (
      <SelectableColumn
        node={node}
        columnName={columnName}
        setSelectedNodeState={setSelectedNodeState}
      />
    );
  },
};

function SelectableColumn({ node, columnName, setSelectedNodeState }) {
  return (
    <Row align="center">
      <ColumnCheckbox
        checked={hasSelectedColumn(node, columnName)}
        onChange={() => {
          setSelectedNodeState((node) => {
            toggleSelectedColumn(node, columnName);
          });
        }}
      />

      <HorizontalSpace />
      <HorizontalSpace />
      {columnName}
      <HorizontalSpace />
    </Row>
  );
}

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
