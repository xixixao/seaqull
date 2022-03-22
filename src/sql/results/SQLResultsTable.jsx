import React, { memo, useState } from "react";
import { Button } from "ui/interactive/Button";
import { Box } from "ui/layout/Box";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import { styled } from "ui/styled/style";
import { isSelectingThisNode } from "../sqlNodes";
import { SQLDisplay } from "./SQLDisplay";
import { useExecuteSQLQuery } from "./useExecuteSQLQuery";

export function SQLResultsTable({
  appState,
  node,
  getQuery,
  children,
  columnHeader,
  color,
}) {
  const state = useExecuteSQLQuery(appState, node, getQuery);
  const [view, setView] = useState("table");
  if (state == null) {
    return null;
  }
  const controls = isSelectingThisNode(appState) ? (
    <ResultsViewControls view={view} setView={setView} />
  ) : null;
  if (state.error != null) {
    return <ResultsLayoutSQL controls={null} sql={state.error} />;
  }
  return view === "table" ? (
    <ResultsLayoutTables
      controls={controls}
      table={
        <ResultsTableLoaded
          node={node}
          state={state}
          columnHeader={columnHeader}
          color={color}
        >
          {children}
        </ResultsTableLoaded>
      }
    />
  ) : (
    <ResultsLayoutSQL
      controls={controls}
      sql={
        <SQLDisplay background="$slate2">
          {
            state.query
            /* executedSql(state.query) */
          }
        </SQLDisplay>
      }
    />
  );
}

export function SQLResultsTableWithRemainingRows({
  appState,
  node,
  getQuery,
  getQueryForRemainingRows,
}) {
  if (!isSelectingThisNode(appState)) {
    return (
      <SQLResultsTable appState={appState} node={node} getQuery={getQuery} />
    );
  }
  return (
    <SQLResultsTable appState={appState} node={node} getQuery={getQuery}>
      <SQLTableBody
        css={{ color: "$slate11" }}
        appState={appState}
        node={node}
        getQuery={getQueryForRemainingRows}
      />
    </SQLResultsTable>
  );
}

function ResultsLayoutTables({ table, controls, updated }) {
  if (controls == null) {
    return table;
  }
  return (
    <>
      {table}
      <ButtonBarWrapper>{controls}</ButtonBarWrapper>
    </>
  );
}

function ResultsLayoutSQL({ sql, controls }) {
  return (
    <>
      {sql}
      <ButtonBarWrapper>{controls}</ButtonBarWrapper>
    </>
  );
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

function ResultsViewControls({ view, setView }) {
  return (
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
        disabled={view === "chart"}
        onClick={() => {
          setView("chart");
        }}
      >
        Chart
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
    </>
  );
}

export function SQLTableBody({ appState, node, getQuery, css }) {
  const state = useExecuteSQLQuery(appState, node, getQuery);
  if (state == null || state.error != null) {
    return null;
  }
  const { values } = state.table;
  return <TableBody css={css} values={values} />;
}

const ResultsTableLoaded = memo(function ResultsTableLoaded({
  state: { appState, table },
  // TODO: This can also break memoization
  node,
  color,
  // TODO: This can also break memoization
  columnHeader,
  // TODO: This will definitely break memoization
  children,
}) {
  const { columns, values } = table;
  const ColumnHeader = columnHeader ?? DefaultColumnHeader;

  return (
    <Table
      css={{
        $$secondary: "$colors$slate11",
        textAlign: "start",
        whiteSpace: "nowrap",
        th: {
          fontWeight: 600,
          height: "36px",
        },
        color,
      }}
    >
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={i}>
              <ColumnHeader
                appState={appState}
                node={node}
                columnName={column}
                columnIndex={i}
              />
            </th>
          ))}
        </tr>
      </thead>
      <TableBody values={values} />
      {children}
    </Table>
  );
});

function DefaultColumnHeader({ columnName }) {
  return columnName;
}

function TableBody({ css, values }) {
  return (
    <TBody css={css}>
      {values.map((row, j) => (
        <tr key={j}>
          {row.map((value, i) => (
            <td key={i}>{value}</td>
          ))}
        </tr>
      ))}
    </TBody>
  );
}
const TBody = styled("tbody");

const Table = styled("table", {
  borderCollapse: "collapse",
  height: "fit-content",
  th: {
    // borderWidth: "1px",
    // borderStyle: "solid",
    // borderColor: "inherit",
    // borderBottom: "1px solid $slate7",
    position: "sticky",
    top: "0",
    background: "$panel",
    whiteSpace: "nowrap",
    textAlign: "start",
    padding: "$8 $4 0 $4",
    boxShadow: "inset 0 -1px 0 $colors$slate7",
  },
  td: {
    // borderWidth: "1px",
    // borderStyle: "solid",
    // borderColor: "inherit",
    // border: "1px solid $slate7",
    padding: "0 4px",
    whiteSpace: "nowrap",
  },
  "tbody tr": {
    borderBottom: "1px solid $slate3",
  },
});
