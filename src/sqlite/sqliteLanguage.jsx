import { QuestionMarkIcon } from "@modulz/radix-icons";
import { addNodeAtPosition } from "editor/AddNodeButton";
import { Editor } from "editor/Editor";
import {
  useAppStateContext,
  useAppStateDataContext,
  useSetAppStateContext,
  useSetSelectedNodeState,
} from "editor/state";
import { keyframes, styled } from "editor/style";
import { Box } from "editor/ui/Box";
import { Button } from "editor/ui/Button";
import { Column } from "editor/ui/Column";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { IconButton } from "editor/ui/IconButton";
import { Link } from "editor/ui/Link";
import { Row } from "editor/ui/Row";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";
import * as LocalStorage from "js/LocalStorage";
import * as Objects from "js/Objects";
import * as Promises from "js/Promises";
import * as Serialize from "js/Serialize";
import React, { memo, useContext, useEffect, useMemo, useState } from "react";
import { format as formatSQL } from "sql-formatter";
import dvdRentalURL from "../sqlite_examples/dvd_rental.db?url";
import { database } from "./database";
import {
  getColumnControl,
  getEmptyNode,
  getQuery,
  getQueryAdditionalValues,
  getQuerySelectable,
  getResults,
  NODE_CONFIGS,
  TIGHT_CHILD_NODES,
} from "./sqliteNodes";
import {
  SQLiteStateContext,
  SQLiteStateProvider,
  useEditorConfig,
  useSetSQLiteState,
} from "./sqliteState";
import { Dialog, DialogContent, DialogTrigger } from "./ui/Dialog";
import { AddFromNodeButton, addQueryStep } from "./ui/SqliteNodeUI";

export default function SQLiteLanguage() {
  return (
    <SQLiteStateProvider>
      <Editor
        topRightUI={<Help />}
        topUI={<AddFromNodeButton />}
        nodeTypes={Objects.map(NODE_CONFIGS, (type) => type.Component)}
        onDoubleClick={addFromNodeOnDoubleClick}
        onKeyDown={addNodeFromKey}
      >
        <LoadFromLocalStorage />
        <Results />
        <SaveToLocalStorage />
      </Editor>
    </SQLiteStateProvider>
  );
}

function SaveToLocalStorage() {
  const appState = useAppStateContext();
  const source = useContext(SQLiteStateContext.source);
  useEffect(() => {
    LocalStorage.writeEventually(Serialize.stringify({ appState, source }));
  }, [appState, source]);
  useEffect(() => LocalStorage.writeOnExit(), []);
  return null;
}

function LoadFromLocalStorage() {
  const [loading, setLoading] = useState(true);
  const setAppState = useSetAppStateContext();
  const setSQLiteState = useSetSQLiteState();
  useEffect(() => {
    const lastState = Serialize.parse(LocalStorage.read());
    if (lastState == null) {
      setLoading(null);
      return;
    }
    const { appState, source } = lastState;
    (async () => {
      setAppState(() => appState);
      if (source?.type === "example") {
        const editorConfig = await database(await loadHostedDatabase());
        setSQLiteState(() => ({ editorConfig, source }));
      } else {
        setLoading(null);
      }
    })();
  }, [setAppState, setSQLiteState]);
  return loading == null ? <WelcomeDialog defaultOpen /> : null;
}

function Help() {
  const source = useContext(SQLiteStateContext.source);
  return (
    <WelcomeDialog>
      <DialogTrigger asChild>
        <Row align="center">
          {source != null ? <Button>{source.name}</Button> : null}
          <IconButton>
            <QuestionMarkIcon />
          </IconButton>
        </Row>
      </DialogTrigger>
    </WelcomeDialog>
  );
}

function WelcomeDialog({ defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const close = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent css={{ padding: "$20", borderRadius: "$8" }}>
        <h1>Welcome to Seaqull(beta)!</h1>
        <br />
        <p>
          This is the SQLite version of <Link newtab>Seaqull</Link>.
        </p>
        <p>
          Would you like to explore the example database or one of your own?
        </p>
        <br />
        <Row>
          <ButtonUseExampleDatabase onDone={close}>
            Example database
          </ButtonUseExampleDatabase>
          <HorizontalSpace />
          <ButtonOpenFile onDone={close}>Open a database file</ButtonOpenFile>
        </Row>
      </DialogContent>
    </Dialog>
  );
}

function ButtonUseExampleDatabase({ onDone, children }) {
  const setSQLiteState = useSetSQLiteState();
  return (
    <Button
      onClick={() => {
        (async () => {
          const editorConfig = await database(await loadHostedDatabase());
          setSQLiteState((state) => ({
            editorConfig,
            source: {
              type: "example",
              name: "dvd_rental.db",
            },
          }));
          onDone();
        })();
      }}
    >
      {children}
    </Button>
  );
}

function ButtonOpenFile({ children, onDone }) {
  const setSQLiteState = useSetSQLiteState();
  return (
    <Button
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", () => {
          (async () => {
            const file = input.files[0];
            const { name } = file;
            const editorConfig = await database(await file.arrayBuffer());
            setSQLiteState((state) => ({
              editorConfig,
              source: { type: "file", name },
            }));
          })();
          onDone();
        });
        input.click();
      }}
    >
      {children}
    </Button>
  );
}

async function loadHostedDatabase() {
  return await (await fetch(dvdRentalURL)).arrayBuffer();
}

function stateFromSnapshot([nodes, positions, edges]) {
  return {
    nodes: idMap(nodes),
    positions: new Map(nodes.map((element, i) => [element.id, positions[i]])),
    edges: idMap(edges),
  };
}

function addFromNodeOnDoubleClick(appState, position) {
  return addNodeAtPosition(appState, getEmptyNode("from"), position);
}

const KEY_LOOKUP = new Map(
  Arrays.map(TIGHT_CHILD_NODES, ({ key }, type) => [key, type])
);

function addNodeFromKey(appState, event) {
  const selectedNode = only(Nodes.selected(appState));
  if (selectedNode == null) {
    return;
  }
  const type = KEY_LOOKUP.get(event.key);
  if (type == null) {
    return;
  }
  return addQueryStep(type)(appState);
}

function idMap(array) {
  return new Map(array.map((element) => [element.id, element]));
}

function Results() {
  const appState = useAppStateDataContext();
  const selected = Nodes.selected(appState);
  const singleSelectedNode = only(selected);
  return (
    <Column
      css={{
        overflow: "scroll",
        padding: "0 $8",
        maxHeight: "100%",
      }}
    >
      {(singleSelectedNode != null
        ? getResults(appState, singleSelectedNode)
        : null) ?? <ResultsTable />}
    </Column>
  );
}

function ResultsTable() {
  const appStateData = useAppStateDataContext();
  const editorConfig = useEditorConfig();
  const appState = useMemo(() => {
    return { ...appStateData, editorConfig };
  }, [appStateData, editorConfig]);
  const [resultsState, setResultsState] = useState(null);
  const [lastShownNode, setLastShownNode] = useState(null);
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (editorConfig.db == null) {
      return;
    }
    const selected = Nodes.selected(appState);
    const isSelecting = selected.length > 0;
    const previous = lastShownNode && Nodes.current(appState, lastShownNode);
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
      .concat(isEditing ? getQueryAdditionalValues(appState, oneShown) : [])
      .filter((query) => query != null)
      .slice(0, 2); // TODO: For now limit number of tables for perf reasons
    // and interaction with dragging
    // console.log(appState);
    // console.log(query);
    if (queries.length > 0) {
      setIsLoading(true);
    }
    let canceled = false;
    const database = editorConfig.db;
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
        appState,
      });
      setUpdated(
        lastShownNode != null &&
          oneShown != null &&
          !Node.is(oneShown, lastShownNode)
      );
      setLastShownNode(oneShown);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  return (
    <>
      <Row
        css={{
          paddingTop: "$4",
          paddingRight: "$16",
          top: 0,
          right: 0,
          position: "absolute",
        }}
        justify="end"
      >
        <Button
          onClick={() => {
            setView(view === "table" ? "sql" : "table");
          }}
        >
          {view === "table" ? "SQL" : "Results"}
        </Button>
      </Row>
      <Box
        css={{
          display: "inline-flex",
          border: "1px solid transparent",
          animation: updated ? `${borderBlink} 1s ease-out` : null,
        }}
      >
        {view === "table" ? (
          <ResultsTableLoaded state={state} />
        ) : (
          <SQL>{state.queries[0]}</SQL>
        )}
      </Box>
    </>
  );
}

const SQL = styled(
  ({ children, ...props }) => <pre {...props}>{formatSQL(children ?? "")}</pre>,
  {
    lineHeight: 1,
    fontFamily: "Menlo, Consolas, Monaco, monospace",
    fontSize: "12px",
  }
);

const borderBlink = keyframes({
  from: { borderColor: "$lime9" },
  to: { borderColor: "transparent" },
});

const ResultsTableLoaded = memo(function ResultsTableLoaded({
  state: { tables, appState },
}) {
  const setSelectedNodeState = useSetSelectedNodeState();
  const selectedNode = only(Nodes.selected(appState));
  if (tables[0] instanceof NoResultsError) {
    return (
      <Column
        css={{ background: "$yellow3", padding: "$12", borderRadius: "$4" }}
      >
        <div>No results from:</div>
        <SQL>{tables[0].sql}</SQL>
      </Column>
    );
  }
  const brokenTable = tables.find((table) => table instanceof ResultError);
  if (brokenTable != null) {
    return (
      <Column css={{ background: "$red3", padding: "$12", borderRadius: "$4" }}>
        <div>{brokenTable.error.toString()} in:</div>
        <SQL>{brokenTable.sql}</SQL>
      </Column>
    );
  }
  return tables.map(({ columns, values }, tableIndex) => {
    const isPrimary = tableIndex === 0;
    return (
      <Table
        key={tableIndex}
        css={{
          textAlign: "start",
          whiteSpace: "nowrap",
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
        <tbody>
          {values.map((row, j) => (
            <tr key={j}>
              {row.map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  });
});

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
    result = db.exec(sql + " LIMIT 100");
  } catch (e) {
    return new ResultError(sql, e);
  }
  if (result.length === 0) {
    return new NoResultsError(sql);
  }
  return result[0];
}
