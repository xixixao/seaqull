import * as Edge from "./Edge";
import * as Node from "./Node";
import * as Nodes from "./Nodes";
import * as Arrays from "./Arrays";
import { only } from "./Arrays";

export function children(appState, node) {
  return Arrays.filter(edges(appState), (edge) =>
    Node.hasID(node, Edge.parentID(edge))
  );
}

export function parents(appState, node) {
  return Arrays.filter(edges(appState), (edge) =>
    Node.hasID(node, Edge.childID(edge))
  );
}

export function parentNode(appState, edge) {
  return Nodes.nodeWithID(appState, Edge.parentID(edge));
}

export function childNode(appState, edge) {
  return Nodes.nodeWithID(appState, Edge.childID(edge));
}

export function tightParent(appState, node) {
  const parent = only(parents(appState, node));
  return parent != null && Edge.isTight(parent) ? parent : null;
}

export function tightChildren(appState, node) {
  return children(appState, node).filter(Edge.isTight);
}

export function detachedChildren(appState, node) {
  return children(appState, node).filter((edge) => !Edge.isTight(edge));
}

export function detachedParents(appState, node) {
  return parents(appState, node).filter((edge) => !Edge.isTight(edge));
}

export function of(appState, node) {
  return Arrays.filter(
    edges(appState),
    (edge) =>
      Node.hasID(node, Edge.childID(edge)) ||
      Node.hasID(node, Edge.parentID(edge))
  );
}

export function edges(appState) {
  return appState.edges;
}

export function removeAll(appState, edges) {
  edges.forEach((edge) => {
    remove(appState, edge);
  });
}

export function remove(appState, edge) {
  return edges(appState).delete(Edge.id(edge));
}

export function addChildren(appState, parent, children) {
  children.forEach((child) => {
    addChild(appState, parent, child);
  });
}

export function addChild(appState, parent, child) {
  add(appState, Edge.newEdge(parent, child));
}

export function addTightChildren(appState, parent, children) {
  children.forEach((child) => {
    addTightChild(appState, parent, child);
  });
}

export function addTightChild(appState, parent, child) {
  add(appState, Edge.newTightEdge(parent, child));
}

// export function addAll(appState, added) {
//   added.forEach((edge) => {
//     add(appState, edge);
//   });
// }

export function add(appState, edge) {
  edges(appState).set(Edge.id(edge), edge);
}
