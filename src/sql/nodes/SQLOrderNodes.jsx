import {
  DashIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@modulz/radix-icons";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React from "react";
import Input from "seaqull/Input";
import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "seaqull/state";
import { IconButton } from "ui/interactive/IconButton";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import { SQLResultsTableOrQuery } from "../results/SQLResultsTable";
import { getColumnNames, getQuery, useNodeConfig } from "../sqlNodes";
import SQLNodeUI, { useStandardControls } from "../ui/SQLNodeUI";
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
    <SQLNodeUI parentLimit={1}>
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
  useControls: useStandardControls,
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    const fromQuery = getQuery(appState, sourceNode);
    if (!hasOrdered(node)) {
      return fromQuery;
    }
    return `SELECT * FROM  (${fromQuery})
    ORDER BY ${orderClause(node)}`;
  },
  columnNames(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return new Set();
    }
    return getColumnNames(appState, sourceNode);
  },
  Results() {
    return (
      <SQLResultsTableOrQuery getQuery={getQuery} columnHeader={ColumnHeader} />
    );
  },
};

function ColumnHeader({ node, columnName }) {
  const setNodeState = useSetNodeState(node);
  return (
    <Row>
      <IconButton
        onClick={() => {
          setNodeState((node) => {
            updateColumnOrder(node, columnName);
          });
        }}
      >
        {(() => {
          switch (columnState(node, columnName)) {
            case "ASC":
              return <TriangleUpIcon />;
            case "DESC":
              return <TriangleDownIcon />;
            default:
              return <DashIcon />;
          }
        })()}
      </IconButton>
      <HorizontalSpace />
      {columnName}
    </Row>
  );
}

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
