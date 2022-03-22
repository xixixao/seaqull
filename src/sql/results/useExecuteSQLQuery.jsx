import React, { useEffect, useState } from "react";
import { SQLDisplay } from "./SQLDisplay";
import { useSQLResultsContext } from "./SQLResultsContext";

export function useExecuteSQLQuery(appState, node, getQuery) {
  const { executeSQLQuery } = useSQLResultsContext();
  const [resultsState, setResultsState] = useState(null);
  // const [updated, setUpdated] = useState();
  // const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    // TODO: Move up
    // .concat(isEditing ? getQueryAdditionalTables(appState, oneShown) : [])
    const query = getQuery(appState, node);
    if (query == null) {
      setResultsState(null);
      return;
    }
    // setIsLoading(true);
    let canceled = false;
    // setIsLoading(false);
    // if (queries.length > 0) {
    const table = executeSQLQuery(query);
    setResultsState({
      query,
      table,
      appState,
      error: errorDisplay(table),
    });
    // TODO: somehow need to do this with a key maybe? Like every time
    // a new key is rendered or something, or when key doesn't match
    // index in the list.
    // setUpdated(
    //   previous != null && oneShown != null && !Node.is(oneShown, previous)
    // );
    // }
    // const NEW_RESULTS_INDICATOR_DURATION = 1000;
    // Promises.delay(NEW_RESULTS_INDICATOR_DURATION).then(() => {
    //   if (canceled) {
    //     return;
    //   }
    //   setUpdated(false);
    // });
    return () => {
      canceled = true;
    };
  }, [appState, executeSQLQuery, getQuery, node]);
  return resultsState;
}

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

function errorDisplay(table) {
  if (table instanceof NoResultsError) {
    return (
      <SQLDisplay background="$yellow3" label="No results from:">
        {table.sql}
      </SQLDisplay>
    );
  }

  if (table instanceof ResultError) {
    return (
      <SQLDisplay background="$red3" label={table.error.toString() + " in:"}>
        {table.sql}
      </SQLDisplay>
    );
  }
  return null;
}
