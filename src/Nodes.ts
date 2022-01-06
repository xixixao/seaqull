import * as Node from "./Node";
import * as Edge from "./Edge";
import * as Edges from "./Edges";
import * as Iterable from "./Iterable";
import * as Arrays from "./Arrays";
import { onlyThrows } from "./Arrays";
import { invariant } from "./invariant";
import { AnyNode, AppState, GraphState } from "./types";

export function select(appState: GraphState, nodes: AnyNode[]) {
  appState.selectedNodeIDs = new Set(nodes.map((node) => Node.id(node)));
}

export function countSelected(appState: GraphState) {
  return appState.selectedNodeIDs.size;
}

export function selected(appState: GraphState) {
  return nodesWithID(appState, appState.selectedNodeIDs);
}

export function nodesWithID(appState: GraphState, ids) {
  return Arrays.map(ids, (id) => nodeWithID(appState, id));
}

export function nodeWithID(appState: GraphState, id) {
  return nodes(appState).get(id);
}

export function nodes(appState: GraphState) {
  return appState.nodes;
}

export function newNode(appState: GraphState, nodeData) {
  return {
    id: newNodeID(appState),
    data: {},
    ...nodeData,
  };
}

export function children(appState: GraphState, node) {
  return nodesWithID(
    appState,
    Edges.children(appState, node).map((edge) => Edge.childID(edge))
  );
}

export function parents(appState: GraphState, node) {
  return nodesWithID(
    appState,
    Edges.parents(appState, node).map((edge) => Edge.parentID(edge))
  );
}

export function tightChildren(appState: GraphState, node: AnyNode) {
  return Edges.tightChildren(appState, node).map((edge) =>
    Edges.childNode(appState, edge)
  );
}

export function parentX(appState: GraphState, node: AnyNode) {
  return onlyThrows(parents(appState, node));
}

export function hasParents(appState: GraphState, node: AnyNode) {
  return Edges.parents(appState, node).length > 0;
}

export function hasDetachedParents(appState: GraphState, node: AnyNode) {
  return Edges.detachedParents(appState, node).length > 0;
}

export function hasChildren(appState: GraphState, node: AnyNode) {
  return Edges.children(appState, node).length > 0;
}

export function hasTightChildren(appState: GraphState, node: AnyNode) {
  return Edges.tightChildren(appState, node).length > 0;
}

export function hasDetachedChildren(appState: GraphState, node: AnyNode) {
  return Edges.detachedChildren(appState, node).length > 0;
}

export function add(appState: AppState, node: AnyNode) {
  nodes(appState).set(Node.id(node), node);
  positions(appState).set(Node.id(node), { x: 0, y: 0 });
}

function positions(appState: AppState) {
  return appState.positions;
}

// export function replace(appState, old, node) {
//   nodes(appState).set(Node.id(old), node);
// }

export function remove(appState: AppState, node: AnyNode) {
  nodes(appState).delete(Node.id(node));
  positions(appState).delete(Node.id(node));
  Edges.removeAll(appState, Edges.of(appState, node));
}

export function tightParent(appState: AppState, node: AnyNode) {
  const edge = Edges.tightParent(appState, node);
  return edge != null ? Edges.parentNode(appState, edge) : null;
}

export function tightRoot(appState: AppState, node: AnyNode) {
  const parent = tightParent(appState, node);
  if (parent == null) {
    return node;
  }
  return tightRoot(appState, parent);
}

export function idSet(nodes) {
  return new Set(nodes.map(Node.id));
}

export function dedupe(nodes) {
  return Array.from(new Set(nodes));
}

const GENERATED_NAMES = "abcdefghijklmnopqrstuvwxyz".split("");

export function ensureLabel(appState, node) {
  if (Node.label(node) == null || Node.label(node) === "") {
    const usedNames = new Set(Iterable.map(nodes(appState), Node.label));
    const generatedName = GENERATED_NAMES.filter(
      (name) => !usedNames.has(name)
    )[0];
    invariant(generatedName != null);
    Node.setLabel(node, generatedName);
  }
}

function newNodeID(appState) {
  return String(
    Math.max(...Arrays.map(nodes(appState), (node) => Node.intID(node))) + 1
  );
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layout(appState, node, nodePositions) {
  const { height } = getDimensions(nodePositions, node);

  tightChildren(appState, node).forEach((child) => {
    Node.move(
      appState,
      child,
      Node.x(appState, node),
      Node.y(appState, node) + height
    );
    layout(appState, child, nodePositions);
  });
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layoutStandalone(node, nodePositions) {
  const INIT_Y = 30;
  const NODE_HORIZONTAL_OFFSET = 30;

  const maxX = Math.max(
    ...nodePositions.map(({ __rf }) => __rf.position.x + __rf.width)
  );

  Node.move(node, maxX + NODE_HORIZONTAL_OFFSET, INIT_Y);
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layoutDetached(parent, node, nodePositions) {
  const NODE_HORIZONTAL_OFFSET = 30;
  const { x, y, width } = getDimensions(nodePositions, parent);
  Node.move(node, x + width + NODE_HORIZONTAL_OFFSET, y);
}

function getDimensions(nodePositions, node) {
  const {
    __rf: {
      position: { x, y },
      width,
      height,
    },
  } = nodePositions.find(({ id }) => Node.hasID(node, id));
  return { x, y, width, height };
}
