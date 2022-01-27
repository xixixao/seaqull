import { SQLite } from "@codemirror/lang-sql";
import { DropdownMenuIcon } from "@modulz/radix-icons";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetSelectedNodeState } from "editor/state";
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
import { getColumnNames, getQuerySelectable } from "../sqliteNodes";
import SqliteInput from "../ui/SqliteInput";
import SqliteNodeUI from "../ui/SqliteNodeUI";

function GroupNode() {
  const node = useNode();
  const setSelectedNodeState = useSetSelectedNodeState();
  return (
    <SqliteNodeUI>
      GROUP BY{" "}
      <SqliteInput
        displayValue={hasGrouped(node) ? null : "∅"}
        value={groupedBy(node)}
        onChange={(groupedBy) => {
          setSelectedNodeState((node) => {
            setGroupedBy(node, groupedBy);
          });
        }}
      />
      <Box css={{ color: !hasGrouped(node) ? "$slate11" : undefined }}>
        SELECT{" "}
        <SqliteInput
          displayValue={hasSelected(node) ? null : "*"}
          value={aggregations(node)}
          onChange={(aggregations) => {
            setSelectedNodeState((node) => {
              setAggregations(node, aggregations);
            });
          }}
        />
      </Box>
    </SqliteNodeUI>
  );
}

export const GroupNodeConfig = {
  Component: GroupNode,
  emptyNodeData: empty,
  hasProblem(appState, node) {
    return false; // TODO
  },
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
  queryAdditionalValues(appState, node) {
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
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  querySelectable(appState, node) {
    if (!hasGrouped(node)) {
      return GroupNodeConfig.query(appState, node);
    }
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    console.log(
      node,
      aggregationList(node),
      aliasedListToAliasedString(aggregationList(node))
    );
    return sql(
      node,
      aliasedListToAliasedString(aggregationList(node)),
      fromQuery
    );
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return hasGrouped(node)
      ? selectableColumns(node)
      : getColumnNames(appState, sourceNode);
  },
  columnControl(appState, node, columnName, setSelectedNodeState, isPrimary) {
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
            setSelectedNodeState((node) => {
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
              setSelectedNodeState((node) => {
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

function hasSelected(node) {
  return node.data.aggregations !== "";
}

function hasSelectedColumn(node, column) {
  return (
    aggregationList(node).find(
      ([aggregation, alias]) => aggregation === column || alias === column
    ) != null
  );
}

function selectableColumns(node) {
  return new Set(aggregationList(node).map(aliasedToName));
}

function aliasedListToString(aliased) {
  return aliased
    .map(([expression, alias]) =>
      alias != null ? `${expression} AS ${alias}` : expression
    )
    .join(", ");
}

function aliasedListToAliasedString(aliased) {
  return aliased
    .map(([expression, alias]) => {
      const name = aliasedToName([expression, alias]);
      console.log(expression, alias, name);
      return name === expression ? name : `${expression} AS ${name}`;
    })
    .join(", ");
}

function aliasedToName([expression, alias]) {
  return alias != null
    ? alias
    : /^\w+$/.test(expression)
    ? expression
    : expression.replace(/\W+/g, " ").trim().replace(/\s+/, "_").toLowerCase();
}

function setGroupedBy(node, groupedBy) {
  console.log("here?", groupedBy);
  node.data.groupedBy = groupedBy;
  addGroupedByToAggregations(node);
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
}

function removeGroupBy(node, removedGroupBy) {
  setGroupedBy(
    node,
    groupedColumns(node)
      .filter((groupBy) => groupBy !== removedGroupBy)
      .join(", ")
  );
  removeAggregation(node, removedGroupBy);
}

function addGroupedByToAggregations(node) {
  // TODO: proper placing in order of grouped by
  node.data.aggregations = [groupedBy(node), aggregations(node)]
    .filter((string) => string !== "")
    .join(", ");
}

function addAggregation(node, aggregation) {
  setAggregations(
    node,
    aliasedListToString(
      aggregationList(node).concat(aliasedExpressionList(aggregation))
    )
  );
}

function removeAggregation(node, removedAggregation) {
  setAggregations(
    node,
    aliasedListToString(
      aggregationList(node).filter(
        ([aggregation, alias]) =>
          aggregation !== removedAggregation && alias !== removedAggregation
      )
    )
  );
}

function aggregationList(node) {
  return aliasedExpressionList(aggregations(node));
}

function expressionList(expressions) {
  return aliasedExpressionList(expressions).map(Arrays.first);
}

function aliasedExpressionList(expressions) {
  // if
  let list = [];
  const cursor = SQLite.language.parser.parse(expressions).cursor();
  cursor.firstChild();
  cursor.firstChild();
  if (cursor.name === "Script") {
    return list;
  }
  let expression = "";
  let alias = null;
  do {
    // TODO: Don't lose comments
    if (cursor.name === "LineComment" || cursor.name === "BlockComment") {
      continue;
    }
    if (cursor.name === "Keyword" && /^as$/i.test(at(cursor, expressions))) {
      cursor.nextSibling();
      alias = at(cursor, expressions);
      continue;
    }
    if (cursor.name === "Punctuation") {
      cursor.nextSibling();
      list.push([expression, alias]);
      expression = "";
      alias = null;
    }
    if (expression !== "" && expressions[cursor.from - 1] === " ") {
      expression += " ";
    }
    expression += at(cursor, expressions);
  } while (cursor.nextSibling());
  if (expression !== "") {
    list.push([expression, alias]);
  }
  return list;
}

function at(cursor, text, inset = 0) {
  return text.substring(cursor.from + inset, cursor.to - inset);
}

function sql(node, aggregations, fromQuery) {
  return `SELECT ${aggregations === "" ? "*" : aggregations}
    FROM (${fromQuery})
    GROUP BY ${groupedBy(node)}`;
}
