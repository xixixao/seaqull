import React from "react";
import { useCallback } from "react";
import {
  NoResultsError,
  ResultError,
  SQLResults,
} from "../../sql/ui/SQLResults";
import {
  useAppGraphWithSelectionAndEditorConfig,
  useEditorConfig,
} from "../sqliteState";

export function SQLiteResults() {
  const editorConfig = useEditorConfig();
  const exec = useCallback(
    (sql) => execQuery(editorConfig.db, sql),
    [editorConfig.db]
  );
  return (
    <SQLResults
      execQuery={exec}
      executedSql={executedSql}
      useAppContext={useAppGraphWithSelectionAndEditorConfig}
    />
  );
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
