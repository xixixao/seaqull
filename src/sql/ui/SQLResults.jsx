import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import * as Promises from "js/Promises";
import React, { memo, useEffect, useState } from "react";
import { format as formatSQL } from "sql-formatter";
import { Button } from "ui/interactive/Button";
import { Box } from "ui/layout/Box";
import { Column } from "ui/layout/Column";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import VerticalSpace from "ui/layout/VerticalSpace";
import { keyframes, styled } from "ui/styled/style";
import {
  getColumnControl,
  getQuery,
  getQueryAdditionalTables,
  getQueryAdditionalValues,
  getQuerySelectable,
  getResults,
} from "../sqlNodes";
import { SQLResultsChart } from "./SQLResultsChart";

export function SQLResults({ executedSql, execQuery, useAppContext }) {
  const appState = useAppContext();
  const selected = Nodes.selected(appState);
  const singleSelectedNode = only(selected);
  return (
    (singleSelectedNode != null
      ? getResults(appState, singleSelectedNode)
      : null) ?? (
      <ResultsView
        executedSql={executedSql}
        execQuery={execQuery}
        useAppContext={useAppContext}
      />
    )
  );
}

function ResultsView({ executedSql, execQuery, useAppContext }) {
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
  const validationError = validateResults(state.tables);
  const controls = <ResultsViewControls view={view} setView={setView} />;
  return validationError == null && (view === "table" || view === "chart") ? (
    view === "table" ? (
      <ResultsLayoutTables
        controls={controls}
        tables={<ResultsTableLoaded state={state} />}
        updated={updated}
      />
    ) : (
      <ResultsLayoutChart
        controls={controls}
        chart={<SQLResultsChart state={state} />}
        updated={updated}
      />
    )
  ) : (
    <ResultsLayoutSQL
      controls={controls}
      sql={
        view !== "sql" ? (
          validationError
        ) : (
          <SQLDisplay background="$slate2">
            {executedSql(state.queries[0])}
          </SQLDisplay>
        )
      }
      updated={updated}
    />
  );
}

function ResultsLayoutTables({ tables, controls, updated }) {
  return (
    <Row
      css={{
        overflow: "scroll",
        padding: "0 $8",
        maxHeight: "100%",
      }}
    >
      <Box
        // border: "1px solid transparent",
        css={{
          display: "inline-flex",
          table: {
            animation: updateAnimation(updated),
          },
        }}
      >
        {tables}
      </Box>
      <Box css={{ paddingLeft: "$8", flexGrow: 1 }}>
        {/* Rendered twice, to create correct scroll buffer space */}
        <Row justify="end">{controls}</Row>
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
        <Row justify="end">{controls}</Row>
      </Box>
    </Row>
  );
}

function ResultsLayoutChart({ controls, chart }) {
  return (
    <Row
      css={{ height: "100%", overflow: "hidden", padding: "$8" }}
      justify="end"
    >
      {chart}
      {controls}
    </Row>
  );
}

function ResultsLayoutSQL({ sql, controls, updated }) {
  return (
    <Row css={{ overflow: "scroll", maxHeight: "100%" }}>
      <Box
        css={{ display: "inline-flex", animation: updateAnimation(updated) }}
      >
        {sql}
      </Box>
      <Box css={{ paddingLeft: "$8", flexGrow: 1 }}>
        {/* Rendered twice, to create correct scroll buffer space */}
        <Row justify="end">{controls}</Row>
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
        <Row justify="end">{controls}</Row>
      </Box>
    </Row>
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

function updateAnimation(updated) {
  return updated ? `${borderBlink} 1s ease-out` : null;
}

const borderBlink = keyframes({
  from: { background: "$lime3" },
  to: {},
});

function validateResults(tables) {
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
  return null;
}

const ResultsTableLoaded = memo(function ResultsTableLoaded({
  state: { appState, tables, additionalValues },
}) {
  console.log("rendering", tables);
  const selectedNode = only(Nodes.selected(appState));
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
    <Row css={{ padding: "$8" }}>
      <Column css={{ background, padding: "$12", borderRadius: "$4" }}>
        {label}
        {label != null ? <VerticalSpace /> : null}
        <SQL>{children}</SQL>
      </Column>
    </Row>
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
