import Input from "editor/Input";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "editor/state";
import { Button } from "editor/ui/Button";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Row } from "editor/ui/Row";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React from "react";
import { getColumnNames, getQuerySelectable, useNodeConfig } from "../sqlNodes";
import SQLNodeUI from "../ui/SQLNodeUI";
import {
  aliasedExpressionList,
  joinList,
  suffixedExpressionList,
} from "./sqlExpressions";

function OrderNode() {
  const node = useNode();
  const setNodeState = useSetNodeState(node);
  const orderExtensions = useNodeConfig(node).useOrderInputExtensions?.();
  return (
    <SQLNodeUI>
      ORDER BY{" "}
      <Input
        emptyDisplayValue="∅"
        extensions={orderExtensions}
        value={orderClause(node)}
        onChange={(orderClause) => {
          setNodeState((node) => {
            setOrderBy(node, orderClause);
          });
        }}
      />
    </SQLNodeUI>
  );
}

export const SQLOrderNodeConfig = {
  name: "OrderNode",
  Component: OrderNode,
  // hasProblem(appState, node) {
  //   return false; // TODO
  // },
  emptyNodeData: empty,
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!hasOrdered(node)) {
      return fromQuery;
    }
    return `SELECT * FROM  (${fromQuery})
    ORDER BY ${orderClause(node)}`;
  },
  queryAdditionalTables() {
    return null;
  },
  querySelectable(appState, node) {
    return SQLOrderNodeConfig.query(appState, node);
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return getColumnNames(appState, sourceNode);
  },
  ColumnControl({ node, columnName }) {
    const setNodeState = useSetNodeState(node);
    return (
      <Row>
        <Button
          onClick={() => {
            setNodeState((node) => {
              updateColumnOrder(node, columnName);
            });
          }}
        >
          {(() => {
            switch (columnState(node, columnName)) {
              case "ASC":
                return "▲";
              case "DESC":
                return "▼";
              default:
                return "-";
            }
          })()}
        </Button>
        <HorizontalSpace />
        {columnName}
      </Row>
    );
  },
};

function empty() {
  return { by: "" };
}

function hasOrdered(node) {
  return aliasedExpressionList(orderClause(node)).length > 0;
}

function orderClause(node) {
  return node.data.by;
  // const columnToOrder = node.data.columnToOrder ?? {};
  // return Object.keys(columnToOrder)
  //   .map((column) => `${column} ${columnToOrder[column]}`)
  //   .join(", ");
}

function columnState(node, columnName) {
  const [, modifier] =
    suffixedExpressionList(orderClause(node)).find(
      ([expression]) => expression === columnName
    ) ?? [];
  return modifier;
}

function setOrderBy(node, orderClause) {
  node.data.by = orderClause;
}

function updateColumnOrder(node, columnName) {
  setOrderBy(
    node,
    joinList(
      suffixedExpressionList(orderClause(node))
        .filter(([expression]) => expression !== columnName)
        .concat(
          (() => {
            switch (columnState(node, columnName)) {
              case "ASC":
                return [[columnName, "DESC"]];
              case "DESC":
                return [];
              default:
                return [[columnName, "ASC"]];
            }
          })()
        )
        .map((pair) => pair.join(" ")),
      orderClause(node)
    )
  );
}
