import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import * as Objects from "js/Objects";
import { getColumnNames } from "../sqliteNodes";

export function columnSchema(appState, node) {
  const sourceNode = only(Nodes.parents(appState, node));
  if (sourceNode == null) {
    return {};
  }
  return Objects.fromKeys(getColumnNames(appState, sourceNode), () => []);
}
