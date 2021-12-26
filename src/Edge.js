import * as Node from "./Node";

export function newEdge(parent, child) {
  const parentID = Node.id(parent);
  const childID = Node.id(child);
  return {
    id: `e${parentID}${childID}`,
    parentID,
    childID,
  };
}

export function id(edge) {
  return edge.id;
}

export function parentID(edge) {
  return edge.parentID;
}

export function childID(edge) {
  return edge.childID;
}
