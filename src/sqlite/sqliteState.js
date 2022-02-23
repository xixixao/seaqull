import {
  useAppGraphAndSelectionContext,
  useAppGraphContext,
} from "seaqull/state";
import { useContext, useMemo } from "react";
import { createContextState } from "../react/contextState";
import { NODE_CONFIGS } from "./sqliteNodes";

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
    () => ({ ...appStateData, editorConfig, nodeConfigs: NODE_CONFIGS }),
    [appStateData, editorConfig]
  );
}

export function useAppGraphWithSelectionAndEditorConfig() {
  const appStateData = useAppGraphAndSelectionContext();
  const editorConfig = useEditorConfig();
  return useMemo(
    () => ({ ...appStateData, editorConfig, nodeConfigs: NODE_CONFIGS }),
    [appStateData, editorConfig]
  );
}
