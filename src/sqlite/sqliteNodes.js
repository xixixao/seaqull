import { invariant } from "js/invariant";
import * as Maps from "js/Maps";
import { FromNodeConfig } from "./nodes/FromNodes";
import { GroupNodeConfig } from "./nodes/GroupNodes";
import { JoinNodeConfig } from "./nodes/JoinNodes";
import { SelectNodeConfig } from "./nodes/SelectNodes";
import { WhereNodeConfig } from "./nodes/WhereNodes";
import { OrderNodeConfig } from "./nodes/OrderNodes";

export function someOrNoneColumnList(columnNames) {
  return columnNames.length > 0 ? columnNames.join(", ") : "∅";
}

export function someOrAllColumnList(columnNames) {
  return columnNames.length > 0 ? columnNames.join(", ") : "*";
}

export const NODE_CONFIGS = {
  from: FromNodeConfig,
  join: JoinNodeConfig,
  select: SelectNodeConfig,
  where: WhereNodeConfig,
  group: GroupNodeConfig,
  order: OrderNodeConfig,
};

export const TIGHT_CHILD_NODES = Maps.from({
  where: {
    label: "WHERE",
    key: "w",
  },
  group: {
    label: "GROUP BY",
    key: "g",
  },
  select: {
    label: "SELECT",
    key: "s",
  },
  order: {
    label: "ORDER BY",
    key: "o",
  },
});

function getConfig(type) {
  const config = NODE_CONFIGS[type];
  // This is for development and should never throw in prod, otherwise
  // the `language` has a bug in it.
  invariant(config != null);
  return config;
}

export function getEmptyNode(type) {
  return { type, data: getConfig(type).emptyNodeData() };
}

function getNodeConfig(node) {
  return getConfig(node.type);
}

export function getResults(appState, node) {
  return getNodeConfig(node).results?.(appState, node);
}

export function getHasProblem(appState, node) {
  return getNodeConfig(node).hasProblem(appState, node);
}

export function getQuery(appState, node) {
  return getNodeConfig(node).query(appState, node);
}

export function getQueryAdditionalTables(appState, node) {
  return getNodeConfig(node).queryAdditionalTables(appState, node);
}

export function getQueryAdditionalValues(appState, node) {
  return getNodeConfig(node).queryAdditionalValues?.(appState, node);
}

export function getQuerySelectable(appState, node) {
  return getNodeConfig(node).querySelectable(appState, node);
}

export function getColumnNames(appState, node) {
  return getNodeConfig(node).columnNames(appState, node);
}

export function getColumnControl(
  appState,
  node,
  column,
  setSelectedNodeState,
  isPrimary,
  i
) {
  return getNodeConfig(node).columnControl(
    appState,
    node,
    column,
    setSelectedNodeState,
    isPrimary,
    i
  );
}
