import * as Node from "./Node";
import * as Edge from "./Edge";
import * as Edges from "./Edges";
import * as Iterable from "./Iterable";
import * as Arrays from "./Arrays";
import { only, onlyThrows } from "./Arrays";
import { invariant } from "./invariant";

export function select(nodeState, nodes) {
  nodeState.selectedNodeIDs = nodes.map((node) => Node.id(node));
}

export function countSelected(nodeState) {
  return nodeState.selectedNodeIDs.length;
}

export function selected(nodeState) {
  return nodesWithID(nodeState, nodeState.selectedNodeIDs);
}

export function nodesWithID(nodeState, ids) {
  return ids.map((id) => nodeWithID(nodeState, id));
}

export function nodeWithID(nodeState, id) {
  return nodes(nodeState).get(id);
}

export function nodes(nodeState) {
  return nodeState.nodes;
}

export function newNode(nodeState, nodeData) {
  return {
    id: newNodeID(nodeState),
    data: {},
    position: { x: 0, y: 0 },
    ...nodeData,
  };
}

export function children(nodeState, node) {
  return nodesWithID(
    nodeState,
    Edges.children(nodeState, node).map((edge) => Edge.childID(edge))
  );
}

export function parents(nodeState, node) {
  return nodesWithID(
    nodeState,
    Edges.parents(nodeState, node).map((edge) => Edge.parentID(edge))
  );
}

export function tightChildren(nodeState, node) {
  return Edges.tightChildren(nodeState, node).map((edge) =>
    Edges.childNode(nodeState, edge)
  );
}

export function parentX(nodeState, node) {
  return onlyThrows(parents(nodeState, node));
}

export function hasParents(nodeState, node) {
  return Edges.parents(nodeState, node).length > 0;
}

export function hasDetachedParents(nodeState, node) {
  return Edges.detachedParents(nodeState, node).length > 0;
}

export function hasChildren(nodeState, node) {
  return Edges.children(nodeState, node).length > 0;
}

export function hasTightChildren(nodeState, node) {
  return Edges.tightChildren(nodeState, node).length > 0;
}

export function hasDetachedChildren(nodeState, node) {
  return Edges.detachedChildren(nodeState, node).length > 0;
}

export function add(nodeState, node) {
  nodes(nodeState).set(Node.id(node), node);
}

export function replace(nodeState, old, node) {
  nodes(nodeState).set(Node.id(old), node);
}

export function remove(nodeState, node) {
  nodes(nodeState).delete(Node.id(node));
  Edges.removeAll(nodeState, Edges.of(nodeState, node));
}

export function tightParent(nodeState, node) {
  const edge = Edges.tightParent(nodeState, node);
  return edge != null ? Edges.parentNode(nodeState, edge) : null;
}

export function tightRoot(nodeState, node) {
  const parent = tightParent(nodeState, node);
  if (parent == null) {
    return node;
  }
  return tightRoot(nodeState, parent);
}

export function idSet(nodes) {
  return new Set(nodes.map(Node.id));
}

export function dedupe(nodes) {
  return Array.from(new Set(nodes));
}

const GENERATED_NAMES = "abcdefghijklmnopqrstuvwxyz".split("");

export function ensureLabel(nodeState, node) {
  if (Node.label(node) == null || Node.label(node) === "") {
    const usedNames = new Set(Iterable.map(nodes(nodeState), Node.label));
    const generatedName = GENERATED_NAMES.filter(
      (name) => !usedNames.has(name)
    )[0];
    invariant(generatedName != null);
    Node.setLabel(node, generatedName);
  }
}

function newNodeID(nodeState) {
  return String(
    Math.max(...Arrays.map(nodes(nodeState), (node) => Node.intID(node))) + 1
  );
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layout(nodeState, node, nodePositions) {
  const { height } = getDimensions(nodePositions, node);
  console.log(node.id, height);

  tightChildren(nodeState, node).forEach((child) => {
    Node.move(child, Node.x(node), Node.y(node) + height);
    layout(nodeState, child, nodePositions);
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
