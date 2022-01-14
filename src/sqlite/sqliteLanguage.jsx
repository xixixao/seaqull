import { useAppStateDataContext, useSetSelectedNodeState } from "editor/state";
import { keyframes, styled } from "editor/style";
import { Box } from "editor/ui/Box";
import { Column } from "editor/ui/Column";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import * as Objects from "js/Objects";
import React, { memo, useEffect, useState } from "react";
import { database } from "./database";
import {
  getColumnControl,
  getQuery,
  getQueryAdditionalValues,
  getQuerySelectable,
  NODE_CONFIGS,
} from "./sqliteNodes";
import { AddFromNodeButton } from "./ui/SqliteNodeUI";

export default function sqliteLanguage(tables, initialStateSnapshot) {
  const DATABASE = database(tables);

  return {
    initialState: stateFromSnapshot(initialStateSnapshot, DATABASE),
    Results() {
      return <ResultsTable db={DATABASE.db} />;
    },
    TopUI: AddFromNodeButton,
    nodeTypes: Objects.map(NODE_CONFIGS, (type) => type.Component),
  };
}

function stateFromSnapshot([nodes, positions, edges], DATABASE) {
  return {
    nodes: idMap(nodes),
    positions: new Map(nodes.map((element, i) => [element.id, positions[i]])),
    edges: idMap(edges),
    editorConfig: DATABASE,
  };
}

function idMap(array) {
  return new Map(array.map((element) => [element.id, element]));
}

function ResultsTable({ db }) {
  const appState = useAppStateDataContext();
  const [tableState, setTableState] = useState(null);
  const [lastShownNode, setLastShownNode] = useState(null);
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const selected = Nodes.selected(appState);
    const isSelecting = selected.length > 0;
    const previous = lastShownNode && Nodes.current(appState, lastShownNode);
    if (previous == null && !isSelecting) {
      setTableState(null);
      return;
    }
    const oneShown = only(selected) ?? previous;
    const isEditing = selected.length === 1;
    console.log(oneShown, selected);
    const queries = (isSelecting ? selected : [oneShown])
      .map((node) =>
        (isEditing ? getQuery : getQuerySelectable)(appState, node)
      )
      .concat(isEditing ? getQueryAdditionalValues(appState, oneShown) : [])
      .filter((query) => query != null)
      .slice(0, 2); // TODO: For now limit number of tables for perf reasons
    // and interaction with dragging
    // console.log(appState);
    // console.log(query);
    if (queries.length > 0) {
      setIsLoading(true);
    }
    const ARTIFICIAL_DELAY = 300;
    db.then((database) =>
      setTimeout(() => {
        setIsLoading(false);
        if (queries.length > 0) {
          setTableState({
            tables: queries.map((query) => execQuery(database, query)),
            appState: appState,
          });
          setUpdated(
            lastShownNode != null &&
              oneShown != null &&
              !Node.is(oneShown, lastShownNode)
          );
          setLastShownNode(oneShown);
        }
        const NEW_RESULTS_INDICATOR_DURATION = 1000;
        setTimeout(() => setUpdated(false), NEW_RESULTS_INDICATOR_DURATION);
      }, ARTIFICIAL_DELAY)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  if (isLoading && tableState == null) {
    return <div style={{ padding: 12 }}>Loading...</div>;
  } else if (tableState == null) {
    return null;
  }
  return (
    <Box
      css={{
        display: "inline-flex",
        border: "1px solid transparent",
        animation: updated ? `${borderBlink} 1s ease-out` : null,
      }}
    >
      <ResultsTableLoaded state={tableState} />
    </Box>
  );
}

const borderBlink = keyframes({
  from: { borderColor: "$lime9" },
  to: { borderColor: "transparent" },
});

const TH = styled("th");
const TD = styled("td");

const ResultsTableLoaded = memo(function ResultsTableLoaded({
  state: { tables, appState },
}) {
  // const { selectedNodeID } = appState;
  // const availableColumnNamesSet = getAvailableColumnNamesSet(
  //   appState,
  //   selectedNodeID
  // );
  // const columnNames = getAllColumnNames(appState, selectedNodeID);
  const setSelectedNodeState = useSetSelectedNodeState();
  const selectedNode = only(Nodes.selected(appState));
  if (tables[0] instanceof NoResultsError) {
    return (
      <Column
        css={{ background: "$amber3", padding: "$12", borderRadius: "$4" }}
      >
        <div>No results</div>
        <div>{tables[0].sql}</div>
      </Column>
    );
  }
  const brokenTable = tables.find((table) => table instanceof ResultError);
  if (brokenTable != null) {
    return (
      <Column css={{ background: "$red3", padding: "$12", borderRadius: "$4" }}>
        <div>{brokenTable.sql}</div>
        <div>{brokenTable.error.toString()}</div>
      </Column>
    );
  }
  const columns = tables[0].columns.concat(
    ...tables.slice(1).map((table) => [""].concat(table.columns))
  );
  const values = [tables[0].values].concat(
    ...tables.slice(1).map((table) => [[[""]], table.values])
  );
  const rowCount = Math.max(...values.map((rows) => rows.length));
  const primaryColumnCount = tables[0].columns.length;
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, i) => {
            const isPrimary = i < primaryColumnCount;
            return (
              <TH
                key={i}
                css={{
                  textAlign: "start",
                  whiteSpace: "nowrap",
                  color: isPrimary ? null : "$slate11",
                  // color: availableColumnNamesSet.has(column) ? "black" : "#ddd",
                }}
              >
                {column !== ""
                  ? (() => {
                      if (selectedNode == null) {
                        return column;
                      }
                      const control = getColumnControl(
                        appState,
                        selectedNode,
                        column,
                        setSelectedNodeState,
                        isPrimary,
                        i
                      );
                      return control ?? column;
                    })()
                  : null}
              </TH>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {[...Array(rowCount)].map((_, j) => (
          <tr key={j}>
            {values.map((rows, tableIndex) =>
              rows[0].map((_, i) => (
                <TD
                  css={{
                    whiteSpace: "nowrap",
                    color: tableIndex > 0 ? "$slate11" : null,
                  }}
                  key={i}
                >
                  {(rows[j] ?? [])[i] ?? ""}
                </TD>
              ))
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

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
    result = db.exec(sql + " LIMIT 100");
  } catch (e) {
    return new ResultError(sql, e);
  }
  if (result.length === 0) {
    return new NoResultsError(sql);
  }
  return result[0];
}
