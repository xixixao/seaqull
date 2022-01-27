import { useContext } from "react";
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
