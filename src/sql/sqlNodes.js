import { invariant } from "js/invariant";
import * as Maps from "js/Maps";
import { useNodeConfigs } from "./SQLNodeConfigsProvider";

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

export const MULTIPLE_PARENT_NODES = Maps.from({
  join: {
    label: "JOIN",
  },
  union: {
    label: "UNION",
  },
  intersect: {
    label: "INTERSECT",
  },
  except: {
    label: "EXCEPT",
  },
});

function getConfig(context, type) {
  const config = context.nodeConfigs[type];
  // This is for development and should never throw in prod, otherwise
  // the `language` has a bug in it.
  invariant(config != null);
  return config;
}

export function getEmptyNode(context, type) {
  return { type, data: getConfig(context, type).emptyNodeData() };
}

function getNodeConfig(context, node) {
  return getConfig(context, node.type);
}

export function useNodeConfig(node) {
  const nodeConfigs = useNodeConfigs();
  return getNodeConfig({ nodeConfigs }, node);
}

export function getResults(context, node) {
  return getNodeConfig(context, node).results?.(context, node);
}

export function getQuery(context, node) {
  return getNodeConfig(context, node).query(context, node);
}

export function getQueryAdditionalTables(context, node) {
  return getNodeConfig(context, node).queryAdditionalTables?.(context, node);
}

export function getQueryAdditionalValues(context, node) {
  return getNodeConfig(context, node).queryAdditionalValues?.(context, node);
}

export function getQuerySelectable(context, node) {
  return getNodeConfig(context, node).querySelectable(context, node);
}

export function getQuerySelectableOrNull(context, node) {
  if (node == null) {
    return null;
  }
  return getNodeConfig(context, node).querySelectable(context, node);
}

export function getColumnNames(context, node) {
  return getNodeConfig(context, node).columnNames(context, node);
}

export function getColumnControl(context, node) {
  return getNodeConfig(context, node).ColumnControl;
}
