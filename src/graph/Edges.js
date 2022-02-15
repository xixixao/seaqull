import * as Edge from "./Edge";
import * as Node from "./Node";
import * as Nodes from "./Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";

export function isAncestor(graph, ancestor, descendant) {
  return children(graph, ancestor).some((childEdge) => {
    const id = Edge.childID(childEdge);
    return (
      Node.hasID(descendant, id) || isAncestor(graph, Node.fake(id), descendant)
    );
  });
}

export function isTightAncestor(graph, ancestor, descendant) {
  const childEdge = tightChild(graph, ancestor);
  if (childEdge == null) {
    return false;
  }
  const id = Edge.childID(childEdge);
  return (
    Node.hasID(descendant, id) ||
    isTightAncestor(graph, Node.fake(id), descendant)
  );
}

export function children(graph, node) {
  return Arrays.filter(edges(graph), (edge) =>
    Node.hasID(node, Edge.parentID(edge))
  );
}

export function parents(graph, node) {
  return Arrays.filter(edges(graph), (edge) =>
    Node.hasID(node, Edge.childID(edge))
  );
}

export function parentNode(graph, edge) {
  return Nodes.nodeWithID(graph, Edge.parentID(edge));
}

export function childNode(graph, edge) {
  return Nodes.nodeWithID(graph, Edge.childID(edge));
}

export function tightParent(graph, node) {
  return only(parents(graph, node).filter(Edge.isTight));
}

export function tightChild(graph, node) {
  return only(children(graph, node).filter(Edge.isTight));
}

export function detachedChildren(graph, node) {
  return children(graph, node).filter((edge) => !Edge.isTight(edge));
}

export function detachedParents(graph, node) {
  return parents(graph, node).filter((edge) => !Edge.isTight(edge));
}

export function of(graph, node) {
  return Arrays.filter(
    edges(graph),
    (edge) =>
      Node.hasID(node, Edge.childID(edge)) ||
      Node.hasID(node, Edge.parentID(edge))
  );
}

export function between(graph, nodes) {
  const nodeIDs = Nodes.idSet(nodes);
  return Arrays.filter(
    edges(graph),
    (edge) =>
      nodeIDs.has(Edge.childID(edge)) && nodeIDs.has(Edge.parentID(edge))
  );
}

export function edges(graph) {
  return graph.edges;
}

export function removeAll(graph, edges) {
  edges.forEach((edge) => {
    remove(graph, edge);
  });
}

export function remove(graph, edge) {
  return edges(graph).delete(Edge.id(edge));
}

export function addChildren(graph, parent, children) {
  children.forEach((child) => {
    addChild(graph, parent, child);
  });
}

export function addChild(graph, parent, child) {
  add(graph, Edge.newEdge(parent, child));
}

export function addTightChild(graph, parent, child) {
  add(graph, Edge.newTightEdge(parent, child));
}

// export function addAll(graph, added) {
//   added.forEach((edge) => {
//     add(graph, edge);
//   });
// }

export function add(graph, edge) {
  edges(graph).set(Edge.id(edge), edge);
}
