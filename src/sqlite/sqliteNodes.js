import { invariant } from "js/invariant";
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

function getConfig(type) {
  const config = NODE_CONFIGS[type];
  invariant(config != null);
  return config;
}

export function getEmptyNode(type) {
  return { type, data: getConfig(type).emptyNodeData() };
}

function getNodeConfig(node) {
  return getConfig(node.type);
}

export function getQuery(appState, node) {
  return getNodeConfig(node).query(appState, node);
}

export function getQueryAdditionalValues(appState, node) {
  return getNodeConfig(node).queryAdditionalValues(appState, node);
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
