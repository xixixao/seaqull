import * as Node from "./Node";
import * as Edge from "./Edge";
import * as Edges from "./Edges";
import * as Arrays from "./Arrays";
import { only, onlyThrows } from "./Arrays";

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

export function hasChildren(nodeState, node) {
  return Edges.children(nodeState, node).length > 0;
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
  return Node.isTight(node) ? only(parents(nodeState, node)) : null;
}

function newNodeID(nodeState) {
  return String(
    Math.max(...Arrays.map(nodes(nodeState), (node) => Node.intID(node))) + 1
  );
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layout(nodeState, node) {
  const NODE_HEIGHT_OFFSET = 30;

  children(nodeState, node).forEach((child) => {
    if (Node.isTight(child)) {
      Node.move(child, Node.x(node), Node.y(node) + NODE_HEIGHT_OFFSET);
      layout(nodeState, child);
    }
  });
}
