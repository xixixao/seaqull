import Input from "editor/Input";
import SqliteNodeUI from "../ui/SqliteNodeUI";
import { useSetSelectedNodeState } from "editor/state";
import { Button } from "editor/ui/Button";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Row } from "editor/ui/Row";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import { produce } from "js/immer";
import React from "react";
import { getColumnNames, getQuerySelectable } from "../sqliteNodes";

function OrderNode(node) {
  const setSelectedNodeState = useSetSelectedNodeState();
  return (
    <SqliteNodeUI node={node}>
      ORDER BY{" "}
      <Input
        value={!hasOrdered(node) ? "∅" : orderClause(node)}
        onChange={(orderClause) => {
          setSelectedNodeState((node) => {
            let columnToOrder = {};
            orderClause
              .split(/, */)
              .map((columnOrder) => columnOrder.split(/ +/))
              .filter(([column]) => column !== "∅")
              .forEach(([column, order]) => {
                columnToOrder[column] = order ?? "ASC";
              });
            node.data.columnToOrder = columnToOrder;
          });
        }}
      />
    </SqliteNodeUI>
  );
}

export const OrderNodeConfig = {
  name: "OrderNode",
  Component: OrderNode,
  hasProblem(appState, node) {
    return false; // TODO
  },
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
  queryAdditionalValues() {
    return null;
  },
  querySelectable(appState, node) {
    return OrderNodeConfig.query(appState, node);
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return getColumnNames(appState, sourceNode);
  },
  columnControl(appState, node, columnName, setSelectedNodeState) {
    // const selectableColumnNames = getColumnNames(appState, node.source);
    // // TODO: Fix O(N^2) algo to be nlogn
    // if (!selectableColumnNames.find((column) => column === columnName)) {
    //   return null;
    // }
    const columnToOrderNotNull = node.data.columnToOrder ?? {};
    const state = columnToOrderNotNull[columnName];
    return (
      <Row>
        <Button
          onClick={() => {
            setSelectedNodeState((node) => {
              node.data.columnToOrder = produce(columnToOrderNotNull, (map) => {
                switch (state) {
                  case "ASC":
                    map[columnName] = "DESC";
                    break;
                  case "DESC":
                    delete map[columnName];
                    break;
                  default:
                    map[columnName] = "ASC";
                }
              });
            });
          }}
        >
          {(() => {
            switch (state) {
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

export function empty() {
  // TODO: Support arbitrary order by clauses
  return { columnToOrder: {} };
}

export function hasOrdered(node) {
  return Object.keys(node.data.columnToOrder).length > 0;
}

export function orderClause(node) {
  const columnToOrder = node.data.columnToOrder ?? {};
  return Object.keys(columnToOrder)
    .map((column) => `${column} ${columnToOrder[column]}`)
    .join(", ");
}
