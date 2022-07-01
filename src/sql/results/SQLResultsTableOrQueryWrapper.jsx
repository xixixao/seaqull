import React, { memo, useState } from "react";
import { Button } from "ui/interactive/Button";
import { Box } from "ui/layout/Box";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import { styled } from "ui/styled/style";
import { getQuery, isSelectingThisNode } from "../sqlNodes";
import { SQLDisplay } from "./SQLDisplay";
import { useExecuteSQLQuery } from "./useExecuteSQLQuery";
import * as Nodes from "graph/Nodes";
import {
  useIsThisOnlySelectedNode,
  useSQLResultsNodeContext,
} from "./SQLResults";
import { useSQLResultsContext } from "./SQLResultsContext";

export function SQLResultsTableOrQueryWrapper({ getQuery, children }) {
  const isThisOnlySelectedNode = useIsThisOnlySelectedNode();
  if (!isThisOnlySelectedNode) {
    return children;
  }

  return <TableWithMenu getQuery={getQuery}>{children}</TableWithMenu>;
}

export function TableWithMenu({ getQuery, children }) {
  const [view, menu] = useTableQueryToggle();
  return (
    <>
      {view === "table" ? children : <SQLQueryDisplay getQuery={getQuery} />}
      <ButtonBarWrapper>{menu}</ButtonBarWrapper>
    </>
  );
}

function SQLQueryDisplay({ getQuery }) {
  const { appState, node } = useSQLResultsNodeContext();
  const { getSQLQueryForExecution } = useSQLResultsContext();
  return (
    <SQLDisplay background="$slate2">
      {getSQLQueryForExecution(getQuery(appState, node))}
    </SQLDisplay>
  );
}

function useTableQueryToggle() {
  const [view, setView] = useState("table");
  return [
    view,
    <>
      <Button
        disabled={view === "table"}
        onClick={() => {
          setView("table");
        }}
      >
        Table
      </Button>
      <HorizontalSpace />
      <Button
        disabled={view === "sql"}
        onClick={() => {
          setView("sql");
        }}
      >
        SQL
      </Button>
    </>,
  ];
}

function ButtonBarWrapper({ children }) {
  return (
    <>
      <Box css={{ paddingLeft: "$8", flexGrow: 1 }}>
        {/* // Rendered twice, to create correct scroll buffer space */}
        <Row justify="end">{children}</Row>
      </Box>
      <Box
        css={{
          padding: "$8",
          top: 0,
          right: 0,
          position: "absolute",
          background: "$panel",
          borderBottomLeftRadius: "$4",
        }}
      >
        <Row justify="end">{children}</Row>
      </Box>
    </>
  );
}
