import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import {
  joinColumnsSchema,
  SQLJoinNodeConfig,
} from "../../sql/nodes/SQLJoinNodes";
import { useAppGraphWithEditorConfig } from "../sqliteState";
import { sqlite } from "./sqliteCompletions";

export const JoinNodeConfig = {
  ...SQLJoinNodeConfig,
  useOnInputExtensions() {
    const appState = useAppGraphWithEditorConfig();
    const node = useNode();
    return sqlite(joinColumnsSchema(appState, node));
  },
};
