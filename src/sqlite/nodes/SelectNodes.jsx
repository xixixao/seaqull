import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "editor/state";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Row } from "editor/ui/Row";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";
import React from "react";
import { getColumnNames, getQuerySelectable } from "../sqliteNodes";
import { useAppStateWithEditorConfig } from "../sqliteState";
import ColumnCheckbox from "../ui/ColumnCheckbox";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";
import { columnSchema } from "./sqliteCompletions";
import {
  aliasedExpressionList,
  aliasedToExpression,
  aliasedToName,
  aliasedToSelectable,
  expressionList,
  joinList,
  stripTrailingComma,
} from "./sqliteExpressions";

function SelectNode() {
  const node = useNode();
  const setNodeState = useSetNodeState(node);
  const appState = useAppStateWithEditorConfig();
  return (
    <SqliteNodeUI>
      SELECT{" "}
      <SqliteInput
        displayValue={hasSelected(node) ? null : "*"}
        schema={columnSchema(appState, node)}
        value={selected(node)}
        onChange={(selected) => {
          setNodeState((node) => {
            setSelected(node, selected);
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
    return sql(selected(node), fromQuery);
  },
  queryAdditionalTables(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasSelected(node)) {
      return null;
    }
    const otherColumns = Arrays.subtractSets(
      getColumnNames(appState, sourceNode),
      new Set(selectedExpressions(node).map(aliasedToName))
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [sql(otherColumns.join(","), fromQuery)];
  },
  querySelectable(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery =
      sourceNode == null ? null : getQuerySelectable(appState, sourceNode);
    return sql(
      selectedExpressions(node).map(aliasedToSelectable).join(","),
      fromQuery
    );
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return hasSelected(node)
      ? new Set(selectedExpressions(node).map(aliasedToName))
      : getColumnNames(appState, sourceNode);
  },
  ColumnControl({ node, columnName }) {
    const setNodeState = useSetNodeState(node);
    return (
      <Row align="center">
        <ColumnCheckbox
          checked={hasSelectedColumn(node, columnName)}
          onChange={() => {
            setNodeState((node) => {
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
  },
};

function empty() {
  return { selected: "" };
}

function selected(node) {
  return node.data.selected;
}

function selectedColumns(node) {
  return expressionList(selected(node));
}

function selectedColumnSet(node) {
  return new Set(selectedColumns(node));
}

function selectedExpressions(node) {
  return aliasedExpressionList(selected(node));
}

function hasSelected(node) {
  return selectedExpressions(node).length > 0;
}

function hasSelectedColumn(node, column) {
  return selectedColumnSet(node).has(column);
}

function setSelected(node, expressions) {
  node.data.selected = expressions;
}

function toggleSelectedColumn(node, columnName) {
  const aliasedList = selectedExpressions(node);
  setSelected(
    node,
    joinList(
      (!hasSelectedColumn(node, columnName)
        ? aliasedList.concat(aliasedExpressionList(columnName))
        : aliasedList.filter(
            ([expression, alias]) =>
              expression !== columnName && alias !== columnName
          )
      ).map(aliasedToExpression),
      selected(node)
    )
  );
}

function sql(expressions, fromQuery) {
  return `SELECT ${
    expressions === "" ? "*" : stripTrailingComma(expressions)
  } FROM (${fromQuery})`;
}
