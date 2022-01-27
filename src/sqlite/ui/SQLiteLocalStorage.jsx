import { useAppStateContext, useSetAppStateContext } from "editor/state";
import * as LocalStorage from "js/LocalStorage";
import * as Serialize from "js/Serialize";
import React, { useContext, useEffect, useState } from "react";
import { database } from "../database";
import { SQLiteStateContext, useSetSQLiteState } from "../sqliteState";
import { loadHostedDatabase, WelcomeDialog } from "./SQLiteWelcomeDialog";

export function SQLiteLocalStorage() {
  return (
    <>
      <LoadFromLocalStorage />
      <SaveToLocalStorage />
    </>
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
