import { useContext } from "react";
import { createContextState } from "../react/contextState";

export const {
  state: SQLiteStateContext,
  useSetState: useSetSQLiteState,
  provider: SQLiteStateProvider,
} = createContextState({
  editorConfig: null,
});

export function useEditorConfig() {
  return useContext(SQLiteStateContext.editorConfig);
}
