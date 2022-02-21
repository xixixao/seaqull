import { DropdownMenuIcon } from "@modulz/radix-icons";
import Input from "editor/Input";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "editor/state";
import { Box } from "editor/ui/Box";
import { Button } from "editor/ui/Button";
import { Column } from "editor/ui/Column";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { IconButton } from "editor/ui/IconButton";
import { Row } from "editor/ui/Row";
import ShowOnClick from "editor/ui/ShowOnClick";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";
import React from "react";
import { getColumnNames, getQuerySelectable, useNodeConfig } from "../sqlNodes";
import SQLNodeUI from "../ui/SQLNodeUI";
import {
  aliasedExpressionList,
  aliasedToExpression,
  aliasedToName,
  aliasedToSelectable,
  expressionList,
  joinList,
  stripTrailingComma,
} from "./sqlExpressions";

function GroupNode() {
  const node = useNode();
  const setNodeState = useSetNodeState(node);
  const groupByExtensions = useNodeConfig(node).useGroupByInputExtensions();
  const selectExtensions = useNodeConfig(node).useSelectInputExtensions();
  return (
    <SQLNodeUI parentLimit={1}>
      GROUP BY{" "}
      <Input
        emptyDisplayValue="∅"
        extensions={groupByExtensions}
        value={groupedBy(node)}
        onChange={(groupedBy) => {
          setNodeState((node) => {
            setGroupedBy(node, groupedBy);
          });
        }}
      />
      <Box css={{ color: !hasGrouped(node) ? "$slate11" : undefined }}>
        SELECT{" "}
        <Input
          emptyDisplayValue="*"
          extensions={selectExtensions}
          value={aggregations(node)}
          onChange={(aggregations) => {
            setNodeState((node) => {
              setAggregations(node, aggregations);
            });
          }}
        />
      </Box>
    </SQLNodeUI>
  );
}

export const SQLGroupNodeConfig = {
  Component: GroupNode,
  emptyNodeData: empty,
  // hasProblem(appState, node) {
  //   return false; // TODO
  // },
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasGrouped(node)) {
      return `SELECT * from (${fromQuery})`;
    }

    return sql(node, aggregations(node), fromQuery);
  },
  queryAdditionalTables(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasGrouped(node)) {
      return null;
    }
    const otherColumns = Arrays.subtractSets(
      getColumnNames(appState, sourceNode),
      groupedColumnSet(node)
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns.join(",")} FROM (${fromQuery})`];
  },
  querySelectable(appState, node) {
    if (!hasGrouped(node)) {
      return SQLGroupNodeConfig.query(appState, node);
    }
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    return sql(
      node,
      aggregationList(node).map(aliasedToSelectable).join(","),
      fromQuery
    );
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return hasGrouped(node)
      ? new Set(aggregationList(node).map(aliasedToName))
      : getColumnNames(appState, sourceNode);
  },
  ColumnControl({ node, columnName, isPrimary }) {
    const setNodeState = useSetNodeState(node);
    const isSelectTable = isPrimary && hasGrouped(node);
    const isToggleable =
      !isSelectTable ||
      hasGroupedColumn(node, columnName) ||
      hasSelectedColumn(node, columnName);
    if (!isToggleable) {
      return columnName;
    }
    return (
      <Row align="center">
        <input
          checked={isSelectTable && hasSelectedColumn(node, columnName)}
          style={{ cursor: "pointer" }}
          type="checkbox"
          onChange={(event) => {
            setNodeState((node) => {
              if (isSelectTable && !hasGroupedColumn(node, columnName)) {
                removeAggregation(node, columnName);
              } else {
                toggleGroupedColumn(node, columnName);
              }
            });
          }}
        />
        <HorizontalSpace />
        <HorizontalSpace />
        {columnName}
        {!isPrimary && hasGrouped(node) ? (
          <AggregationSelector
            onChange={(aggregation) => {
              setNodeState((node) => {
                addAggregation(node, AGGREGATIONS[aggregation](columnName));
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

function empty() {
  return { groupedBy: "", aggregations: "" };
}

function hasGrouped(node) {
  return groupedColumns(node).length > 0;
}

function groupedBy(node) {
  return node.data.groupedBy;
}

function groupedColumns(node) {
  return expressionList(groupedBy(node));
}

function groupedColumnSet(node) {
  return new Set(groupedColumns(node));
}

function hasGroupedColumn(node, column) {
  return groupedColumnSet(node).has(column);
}

function aggregations(node) {
  return node.data.aggregations;
}

function hasSelectedColumn(node, column) {
  return (
    aggregationList(node).find(
      ([aggregation, alias]) => aggregation === column || alias === column
    ) != null
  );
}

function setGroupedBy(node, groupedBy) {
  node.data.groupedBy = groupedBy;
}

function setAggregations(node, aggregations) {
  node.data.aggregations = aggregations;
}

function toggleGroupedColumn(node, columnName) {
  if (hasGroupedColumn(node, columnName)) {
    removeGroupBy(node, columnName);
  } else {
    addGroupBy(node, columnName);
  }
}

function addGroupBy(node, groupBy) {
  setGroupedBy(node, [...groupedColumns(node), groupBy].join(", "));
  addAggregation(node, groupBy);
}

function removeGroupBy(node, removedGroupBy) {
  setGroupedBy(
    node,
    joinList(
      groupedColumns(node).filter((groupBy) => groupBy !== removedGroupBy),
      groupedBy(node)
    )
  );
  removeAggregation(node, removedGroupBy);
}

function addAggregation(node, aggregation) {
  setAggregationsFromList(
    node,
    aggregationList(node).concat(aliasedExpressionList(aggregation))
  );
}

function removeAggregation(node, removedAggregation) {
  setAggregationsFromList(
    node,
    aggregationList(node).filter(
      ([aggregation, alias]) =>
        aggregation !== removedAggregation && alias !== removedAggregation
    )
  );
}

function setAggregationsFromList(node, aggregationList) {
  setAggregations(
    node,
    joinList(aggregationList.map(aliasedToExpression), aggregations(node))
  );
}

function aggregationList(node) {
  return aliasedExpressionList(aggregations(node));
}

function sql(node, aggregations, fromQuery) {
  return `SELECT ${aggregations === "" ? "*" : stripTrailingComma(aggregations)}
    FROM (${fromQuery})
    GROUP BY ${stripTrailingComma(groupedBy(node))}`;
}
