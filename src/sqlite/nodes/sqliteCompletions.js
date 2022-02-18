import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import * as Objects from "js/Objects";
import { schemaCompletion, SQLite } from "@codemirror/lang-sql";
import { LanguageSupport } from "@codemirror/language";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useAppGraphWithEditorConfig } from "../sqliteState";
import { getColumnNames } from "../../sql/sqlNodes";

export function useColumnSchema() {
  const node = useNode();
  const appState = useAppGraphWithEditorConfig();
  return sqlite(columnSchema(appState, node));
}

export function columnSchema(appState, node) {
  const sourceNode = only(Nodes.parents(appState, node));
  if (sourceNode == null) {
    return {};
  }
  return Objects.fromKeys(getColumnNames(appState, sourceNode), () => []);
}

export function sqlite(schema) {
  return [
    sql({
      dialect: SQLite,
      schema,
    }),
  ];
}

// Dont suggest keywords, there are too many
function sql(config) {
  return new LanguageSupport(config.dialect.language, [
    schemaCompletion(config),
  ]);
}
