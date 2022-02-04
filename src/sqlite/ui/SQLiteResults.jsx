import { useAppStateDataContext, useSetSelectedNodeState } from "editor/state";
import { keyframes, styled } from "editor/style";
import { Box } from "editor/ui/Box";
import { Button } from "editor/ui/Button";
import { Column } from "editor/ui/Column";
import { Row } from "editor/ui/Row";
import VerticalSpace from "editor/ui/VerticalSpace";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import * as Promises from "js/Promises";
import React, { memo, useEffect, useRef, useState } from "react";
import { format as formatSQL } from "sql-formatter";
import {
  getColumnControl,
  getQuery,
  getQueryAdditionalTables,
  getQueryAdditionalValues,
  getQuerySelectable,
  getResults,
} from "../sqliteNodes";
import { useAppStateWithEditorConfig } from "../sqliteState";

export function SQLiteResults() {
  const appState = useAppStateDataContext();
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
        : null) ?? <ResultsTable />}
    </Row>
  );
}

function ResultsTable() {
  const appState = useAppStateWithEditorConfig();
  const [resultsState, setResultsState] = useState(null);
  const lastShownNode = useRef();
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (appState.editorConfig.db == null) {
      return;
    }
    const selected = Nodes.selected(appState);
    const isSelecting = selected.length > 0;
    const previous =
      lastShownNode.current != null &&
      Nodes.current(appState, lastShownNode.current);
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
    const database = appState.editorConfig.db;
    if (canceled) {
      return;
    }
    // const ARTIFICIAL_DELAY = 300;
    // setTimeout(() => {
    setIsLoading(false);
    if (queries.length > 0) {
      setResultsState({
        queries,
        tables: queries.map((query) => execQuery(database, query)),
        additionalValues: additionalValuesQueries
          .map((query) => execQuery(database, query))
          .filter((result) => !(result instanceof NoResultsError)),
        appState,
      });
      setUpdated(
        lastShownNode != null &&
          oneShown != null &&
          !Node.is(oneShown, lastShownNode)
      );
      lastShownNode.current = oneShown;
    }
    const NEW_RESULTS_INDICATOR_DURATION = 1000;
    Promises.delay(NEW_RESULTS_INDICATOR_DURATION).then(() => {
      if (canceled) {
        return;
      }
      setUpdated(false);
    });
    // }, ARTIFICIAL_DELAY)
    return () => {
      canceled = true;
    };
  }, [appState]);

  if (isLoading && resultsState == null) {
    return <div style={{ padding: 12 }}>Loading...</div>;
  } else if (resultsState == null) {
    return null;
  }
  return <ResultsDisplay updated={updated} state={resultsState} />;
}

function ResultsDisplay({ updated, state }) {
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
  const setSelectedNodeState = useSetSelectedNodeState();
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
                  : getColumnControl(
                      appState,
                      selectedNode,
                      column,
                      setSelectedNodeState,
                      isPrimary,
                      i
                    ) ?? column}
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

class ResultError {
  constructor(sql, error) {
    this.sql = sql;
    this.error = error;
  }
}

class NoResultsError {
  constructor(sql) {
    this.sql = sql;
  }
}

function execQuery(db, sql) {
  // console.log(sql);
  let result = null;
  try {
    result = db.exec(executedSql(sql));
  } catch (e) {
    return new ResultError(sql, e);
  }
  if (result.length === 0) {
    return new NoResultsError(sql);
  }
  return result[0];
}

function executedSql(sql) {
  return sql + (/limit \d+\s*$/i.test(sql) ? "" : " LIMIT 100");
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
