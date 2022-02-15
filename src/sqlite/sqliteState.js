import {
  useAppGraphAndSelectionContext,
  useAppGraphContext,
} from "editor/state";
import { useContext, useMemo } from "react";
import { createContextState } from "../react/contextState";

export const {
  state: SQLiteStateContext,
  useSetState: useSetSQLiteState,
  provider: SQLiteStateProvider,
} = createContextState({
  source: null,
  editorConfig: {
    tableExists() {
      return false;
    },
    tableColumns() {
      return [];
    },
  },
});

export function useEditorConfig() {
  return useContext(SQLiteStateContext.editorConfig);
}

export function useAppGraphWithEditorConfig() {
  const appStateData = useAppGraphContext();
  const editorConfig = useEditorConfig();
  return useMemo(
    () => ({ ...appStateData, editorConfig }),
    [appStateData, editorConfig]
  );
}

export function useAppGraphWithSelectionAndEditorConfig() {
  const appStateData = useAppGraphAndSelectionContext();
  const editorConfig = useEditorConfig();
  return useMemo(
    () => ({ ...appStateData, editorConfig }),
    [appStateData, editorConfig]
  );
}
