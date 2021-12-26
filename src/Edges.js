import * as Edge from "./Edge";
import * as Node from "./Node";
import * as Nodes from "./Nodes";
import * as Arrays from "./Arrays";

export function children(nodeState, node) {
  return Arrays.filter(edges(nodeState), (edge) =>
    Node.hasID(node, Edge.parentID(edge))
  );
}

export function parents(nodeState, node) {
  return Arrays.filter(edges(nodeState), (edge) =>
    Node.hasID(node, Edge.childID(edge))
  );
}

export function of(nodeState, node) {
  return Arrays.filter(
    edges(nodeState),
    (edge) =>
      Node.hasID(node, Edge.childID(edge)) ||
      Node.hasID(node, Edge.parentID(edge))
  );
}

export function edges(nodeState) {
  return nodeState.edges;
}

export function removeAll(nodeState, edges) {
  edges.forEach((edge) => {
    remove(nodeState, edge);
  });
}

export function remove(nodeState, edge) {
  return edges(nodeState).delete(Edge.id(edge));
}

export function addChildren(nodeState, parent, children) {
  children.forEach((child) => {
    addChild(nodeState, parent, child);
  });
}

export function addChild(nodeState, parent, child) {
  add(nodeState, Edge.newEdge(parent, child));
}

// export function addAll(nodeState, added) {
//   added.forEach((edge) => {
//     add(nodeState, edge);
//   });
// }

export function add(nodeState, edge) {
  edges(nodeState).set(Edge.id(edge), edge);
}

export function isTight(nodeState, edge) {
  return Node.isTight(Nodes.nodeWithID(nodeState, Edge.childID(edge)));
}
