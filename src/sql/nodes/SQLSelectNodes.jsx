import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";
import React from "react";
import Input from "seaqull/Input";
import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import { useAppGraphContext, useSetNodeState } from "seaqull/state";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { HorizontalSplitView } from "ui/layout/HorizontalSplitView";
import { Row } from "ui/layout/Row";
import ColumnCheckbox from "../results/ColumnCheckbox";
import { SQLResultsTable, SQLResultsTables } from "../results/SQLResultsTable";
import { getColumnNames, getQuery, useNodeConfig } from "../sqlNodes";
import SQLNodeUI, { useStandardControls } from "../ui/SQLNodeUI";
import {
  aliasedExpressionList,
  aliasedToExpression,
  aliasedToName,
  aliasedToSelectable,
  expressionList,
  joinList,
  stripTrailingComma,
} from "./sqlExpressions";

function SelectNode() {
  const node = useNode();
  const setNodeState = useSetNodeState(node);
  const selectExtensions = useNodeConfig(node).useSelectInputExtensions();
  return (
    <SQLNodeUI parentLimit={1}>
      SELECT{" "}
      <Input
        emptyDisplayValue="*"
        extensions={selectExtensions}
        value={selected(node)}
        onChange={(selected) => {
          setNodeState((node) => {
            setSelected(node, selected);
          });
        }}
      />
    </SQLNodeUI>
  );
}

export const SQLSelectNodeConfig = {
  Component: SelectNode,
  emptyNodeData: empty,
  useControls: useStandardControls,
  useHasProblem() {
    const appState = useAppGraphContext();
    const node = useNode();
    return !Nodes.hasOnlyParent(appState, node);
  },
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery =
      sourceNode == null ? null : getQuery(appState, sourceNode);
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
  querySelected(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery =
      sourceNode == null ? null : getQuery(appState, sourceNode);
    return sql(selected(node), fromQuery);
  },
  queryUnselected(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuery(appState, sourceNode);
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
  Results() {
    return (
      <SQLResultsTables getQuery={getQuery}>
        <HorizontalSplitView>
          <SQLResultsTable
            getQuery={SQLSelectNodeConfig.querySelected}
            columnHeader={ColumnHeader}
          />
          <SQLResultsTable
            getQuery={SQLSelectNodeConfig.queryUnselected}
            columnHeader={ColumnHeader}
            color="$$secondary"
          />
        </HorizontalSplitView>
      </SQLResultsTables>
    );
  },
};

function ColumnHeader({ node, columnName }) {
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
}

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
