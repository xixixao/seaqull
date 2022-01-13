import { DropdownMenuIcon } from "@modulz/radix-icons";
import SqliteNodeUI from "../ui/SqliteNodeUI";
import { Button } from "editor/ui/Button";
import { Column } from "editor/ui/Column";
import { IconButton } from "editor/ui/IconButton";
import { Row } from "editor/ui/Row";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import * as Arrays from "js/Arrays";
import React from "react";
import {
  getColumnNames,
  getQuerySelectable,
  someOrAllColumnList,
  someOrNoneColumnList,
} from "../sqliteNodes";
import { Box } from "editor/ui/Box";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import ShowOnClick from "editor/ui/ShowOnClick";

function GroupNode(node) {
  return (
    <SqliteNodeUI node={node}>
      <div>
        GROUP BY {someOrNoneColumnList(Array.from(groupedColumns(node)))}
      </div>
      <Box css={{ color: !hasGrouped(node) ? "$slate11" : undefined }}>
        SELECT {someOrAllColumnList(selectedColumnExpressions(node))}
      </Box>
    </SqliteNodeUI>
  );
}

export const GroupNodeConfig = {
  Component: GroupNode,
  emptyNodeData: empty,
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasGrouped(node)) {
      return `SELECT * from (${fromQuery})`;
    }

    return sql(node, selectedColumnExpressions(node), fromQuery);
  },
  queryAdditionalValues(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasGrouped(node)) {
      return null;
    }
    const otherColumns = Arrays.subtractSets(
      getColumnNames(appState, sourceNode),
      groupedColumns(node)
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  querySelectable(appState, node) {
    if (!hasGrouped(node)) {
      return GroupNodeConfig.query(appState, node);
    }
    const sourceNode = only(Nodes.parents(appState, node));
    const fromQuery = getQuerySelectable(appState, sourceNode);
    return sql(node, selectedColumnExpressionsAliased(node), fromQuery);
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    return hasGrouped(node)
      ? selectedColumns(node)
      : getColumnNames(appState, sourceNode);
  },
  columnControl(appState, node, columnName, setSelectedNodeState, isPrimary) {
    return (
      <Row align="center">
        <input
          checked={hasGroupedColumn(node, columnName)}
          style={{ cursor: "pointer" }}
          type="checkbox"
          onChange={(event) => {
            setSelectedNodeState((node) => {
              toggleGroupedColumn(node, columnName);
            });
          }}
        />
        <HorizontalSpace />
        <HorizontalSpace />
        {columnName}
        {!isPrimary && hasGrouped(node) ? (
          <AggregationSelector
            onChange={(aggregation) => {
              setSelectedNodeState((node) => {
                addAggregation(node, columnName, aggregation);
              });
            }}
          />
        ) : null}
      </Row>
    );
  },
};

function AggregationSelector({ onChange }) {
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
        {Object.keys(AGGREGATIONS).map((aggregation) => (
          <Button
            css={{ marginTop: "$4" }}
            key={aggregation}
            onClick={() => onChange(aggregation)}
          >
            {aggregation}
          </Button>
        ))}
      </Column>
    </ShowOnClick>
    /* <Tooltip content="Select aggregation" side="bottom" align="start">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DropdownMenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>Hello</DropdownMenuContent>
      </DropdownMenu>
    </Tooltip> */
  );
}

export const AGGREGATIONS = {
  "COUNT DISTINCT": (column) => `COUNT(DISTINCT ${column})`,
  AVG: (column) => `AVG(${column})`,
  MIN: (column) => `MIN(${column})`,
  MAX: (column) => `MAX(${column})`,
};

export function empty() {
  return { groupedColumns: new Set(), aggregations: [] };
}

export function hasGrouped(node) {
  return node.data.groupedColumns.size > 0;
}

export function groupedColumns(node) {
  return node.data.groupedColumns;
}

export function hasGroupedColumn(node, column) {
  return node.data.groupedColumns.has(column);
}

export function aggregations(node) {
  return node.data.aggregations;
}

// TODO: allow unselecting groupedColumns
export function selectedColumnExpressions(node) {
  const grouped = groupedColumns(node);
  const aggregatedColumns = aggregations(node).map(aggregateExpression);
  return Array.from(grouped).concat(aggregatedColumns);
}

export function selectedColumnExpressionsAliased(node) {
  const grouped = groupedColumns(node);
  const aggregatedColumns = aggregations(node).map(
    (columnAndAggregation) =>
      `${aggregateExpression(columnAndAggregation)} as ${aggregationAlias(
        columnAndAggregation
      )}`
  );
  return Array.from(grouped).concat(aggregatedColumns);
}

export function selectedColumns(node) {
  const grouped = groupedColumns(node);
  const aggregatedColumns = aggregations(node).map(aggregationAlias);
  return new Set(Array.from(grouped).concat(aggregatedColumns));
}

function aggregateExpression([columnName, aggregation]) {
  return AGGREGATIONS[aggregation](columnName);
}

function aggregationAlias([columnName, aggregation]) {
  return `${aggregation.toLowerCase().split(/\s+/).join("_")}_${columnName}`;
}

export function addAggregation(node, columnName, aggregation) {
  node.data.aggregations.push([columnName, aggregation]);
}

export function toggleGroupedColumn(node, columnName) {
  const columns = groupedColumns(node);
  if (columns.has(columnName)) {
    columns.delete(columnName);
  } else {
    columns.add(columnName);
  }
}

export function sql(node, selectExpressions, fromQuery) {
  return `SELECT ${selectExpressions.join(", ")}
  FROM (${fromQuery})
  GROUP BY ${Array.from(groupedColumns(node)).join(", ")}`;
}
