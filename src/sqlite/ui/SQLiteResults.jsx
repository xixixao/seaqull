import React, { useCallback, useMemo } from "react";
import { SQLResults } from "../../sql/results/SQLResults";
import { SQLResultsContextProvider } from "../../sql/results/SQLResultsContext";
import {
  NoResultsError,
  ResultError,
} from "../../sql/results/useExecuteSQLQuery";
import {
  useAppGraphWithSelectionAndEditorConfig,
  useEditorConfig,
} from "../sqliteState";

// TODO: I need to push this context around the whole editor
// to be able to query data from inside the node editor
// which I need for inferring chart type from inside
// the chart nodes
// The only thing to worry about is that now the context
// value might have to be null before the db is loaded
// but that's probably good to guard against in all situations
export function SQLiteResults() {
  const appState = useAppGraphWithSelectionAndEditorConfig();
  const editorConfig = useEditorConfig();
  const executeSQLQuery = useCallback(
    (sql) => execQuery(editorConfig.db, sql),
    [editorConfig.db]
  );
  const sqlResultsProps = useMemo(
    () => ({
      getSQLQueryForExecution,
      executeSQLQuery,
    }),
    [executeSQLQuery]
  );
  if (editorConfig.db == null) {
    return null;
  }
  return (
    <SQLResultsContextProvider value={sqlResultsProps}>
      <SQLResults appState={appState} />
    </SQLResultsContextProvider>
  );
}

function execQuery(db, sql) {
  // console.log(sql);
  let result = null;
  try {
    result = db.exec(getSQLQueryForExecution(sql));
  } catch (e) {
    return new ResultError(sql, e);
  }
  if (result.length === 0) {
    return new NoResultsError(sql);
  }
  return result[0];
}

function getSQLQueryForExecution(sql) {
  return sql + (/limit \d+\s*$/i.test(sql) ? "" : " LIMIT 100");
}
