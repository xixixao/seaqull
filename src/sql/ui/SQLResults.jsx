import { keyframes, styled } from "seaqull/style";
import { Box } from "seaqull/ui/Box";
import { Button } from "seaqull/ui/Button";
import { Column } from "seaqull/ui/Column";
import { Row } from "seaqull/ui/Row";
import VerticalSpace from "seaqull/ui/VerticalSpace";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import * as Promises from "js/Promises";
import React, { memo, useEffect, useState } from "react";
import { format as formatSQL } from "sql-formatter";
import {
  getColumnControl,
  getQuery,
  getQueryAdditionalTables,
  getQueryAdditionalValues,
  getQuerySelectable,
  getResults,
} from "../sqlNodes";

export function SQLResults({ executedSql, execQuery, useAppContext }) {
  const appState = useAppContext();
  const selected = Nodes.selected(appState);
  const singleSelectedNode = only(selected);
  return (
    <Row
      css={{
        overflow: "scroll",
        padding: "0 $8",
        maxHeight: "100%",
      }}
    >
      {(singleSelectedNode != null
        ? getResults(appState, singleSelectedNode)
        : null) ?? (
        <ResultsTable
          executedSql={executedSql}
          execQuery={execQuery}
          useAppContext={useAppContext}
        />
      )}
    </Row>
  );
}

function ResultsTable({ executedSql, execQuery, useAppContext }) {
  const appState = useAppContext();
  const [resultsState, setResultsState] = useState(null);
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const selected = Nodes.selected(appState);
    const isSelecting = selected.length > 0;
    const previous = only(Nodes.lastSelected(appState));
    if (previous == null && !isSelecting) {
      setResultsState(null);
      return;
    }
    const oneShown = only(selected) ?? previous;
    const isEditing = selected.length === 1;
    const queries = (isSelecting ? selected : [oneShown])
      .map((node) =>
        (isEditing ? getQuery : getQuerySelectable)(appState, node)
      )
      .concat(isEditing ? getQueryAdditionalTables(appState, oneShown) : [])
      .filter((query) => query != null)
      .slice(0, 2); // TODO: For now limit number of tables for perf reasons
    const additionalValuesQueries = [
      isEditing ? getQueryAdditionalValues(appState, oneShown) : null,
    ].filter((query) => query != null);
    // and interaction with dragging
    // console.log(appState);
    // console.log(query);
    if (queries.length > 0) {
      setIsLoading(true);
    }
    let canceled = false;
    if (canceled) {
      return;
    }
    setIsLoading(false);
    if (queries.length > 0) {
      setResultsState({
        queries,
        tables: queries.map((query) => execQuery(query)),
        additionalValues: additionalValuesQueries
          .map((query) => execQuery(query))
          .filter((result) => !(result instanceof NoResultsError)),
        appState,
      });
      setUpdated(
        previous != null && oneShown != null && !Node.is(oneShown, previous)
      );
    }
    const NEW_RESULTS_INDICATOR_DURATION = 1000;
    Promises.delay(NEW_RESULTS_INDICATOR_DURATION).then(() => {
      if (canceled) {
        return;
      }
      setUpdated(false);
    });
    return () => {
      canceled = true;
    };
  }, [appState, execQuery]);

  if (isLoading && resultsState == null) {
    return <div style={{ padding: 12 }}>Loading...</div>;
  } else if (resultsState == null) {
    return null;
  }
  return (
    <ResultsDisplay
      updated={updated}
      state={resultsState}
      executedSql={executedSql}
    />
  );
}

function ResultsDisplay({ updated, state, executedSql }) {
  const [view, setView] = useState("table");
  const controls = (
    <Row justify="end">
      <Button
        onClick={() => {
          setView(view === "table" ? "sql" : "table");
        }}
      >
        {view === "table" ? "SQL" : "Results"}
      </Button>
    </Row>
  );
  return (
    <>
      <Box
        css={{
          display: "inline-flex",
          // border: "1px solid transparent",
          table: {
            animation: updated ? `${borderBlink} 1s ease-out` : null,
          },
        }}
      >
        {view === "table" ? (
          <ResultsTableLoaded state={state} />
        ) : (
          <SQLDisplay background="$slate2">
            {executedSql(state.queries[0])}
          </SQLDisplay>
        )}
      </Box>

      <Box css={{ paddingLeft: "$8", flexGrow: 1 }}>
        {
          // Rendered twice, to create correct scroll buffer space
          controls
        }
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
        {controls}
      </Box>
    </>
  );
}

const borderBlink = keyframes({
  from: { background: "$lime3" },
  to: {},
});

const ResultsTableLoaded = memo(function ResultsTableLoaded({
  state: { appState, tables, additionalValues },
}) {
  const selectedNode = only(Nodes.selected(appState));
  if (tables[0] instanceof NoResultsError) {
    return (
      <SQLDisplay background="$yellow3" label="No results from:">
        {tables[0].sql}
      </SQLDisplay>
    );
  }
  const brokenTable = tables.find((table) => table instanceof ResultError);
  if (brokenTable != null) {
    return (
      <SQLDisplay
        background="$red3"
        label={brokenTable.error.toString() + " in:"}
      >
        {brokenTable.sql}
      </SQLDisplay>
    );
  }
  return tables.map(({ columns, values }, tableIndex) => {
    const isPrimary = tableIndex === 0;
    const moreValues = additionalValues[tableIndex];
    return (
      <Table
        key={tableIndex}
        css={{
          textAlign: "start",
          whiteSpace: "nowrap",
          th: {
            fontWeight: 600,
            height: "36px",
          },
          color: isPrimary ? null : "$slate11",
        }}
      >
        <thead>
          <tr>
            {columns.map((column, i) => (
              <th key={i}>
                {selectedNode == null
                  ? column
                  : nodeColumnControl(
                      appState,
                      selectedNode,
                      column,
                      isPrimary,
                      i
                    )}
              </th>
            ))}
          </tr>
        </thead>
        <TableBody values={values} />
        {moreValues != null ? (
          <TableBody css={{ color: "$slate11" }} values={moreValues.values} />
        ) : null}
      </Table>
    );
  });
});

function nodeColumnControl(appState, node, column, isPrimary, columnIndex) {
  const ColumnControl = getColumnControl(appState, node);
  return (
    <ColumnControl
      appState={appState}
      node={node}
      columnName={column}
      isPrimary={isPrimary}
      columnIndex={columnIndex}
    />
  );
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
const Table = styled("table");

export class ResultError {
  constructor(sql, error) {
    this.sql = sql;
    this.error = error;
  }
}

export class NoResultsError {
  constructor(sql) {
    this.sql = sql;
  }
}

function SQLDisplay({ background, label, children }) {
  return (
    <Box css={{ paddingTop: "$8" }}>
      <Column css={{ background, padding: "$12", borderRadius: "$4" }}>
        {label}
        {label != null ? <VerticalSpace /> : null}
        <SQL>{children}</SQL>
      </Column>
    </Box>
  );
}

const SQL = styled(
  ({ children, ...props }) => (
    <pre {...props}>
      {formatSQL(children ?? "", { language: "postgresql" })}
    </pre>
  ),
  {
    lineHeight: 1,
    fontFamily: "Menlo, Consolas, Monaco, monospace",
    fontSize: "12px",
  }
);
