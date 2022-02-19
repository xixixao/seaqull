import * as Node from "./Node";

export function newEdge(parent, child, childHandleIndex) {
  const parentID = Node.id(parent);
  const childID = Node.id(child);
  return {
    id: `e${parentID}${childID}`,
    parentID,
    childID,
    targetHandle: childHandleIndex,
  };
}

export function newTightEdge(parent, child) {
  return { ...newEdge(parent, child), type: "tight" };
}

export function replicateEdge(edge, nodeMapping) {
  return (isTight(edge) ? newTightEdge : newEdge)(
    nodeMapping.get(parentID(edge)),
    nodeMapping.get(childID(edge)),
    childHandleIndex(edge)
  );
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

export function childHandleIndex(edge) {
  return edge.targetHandle;
}

export function isTight(edge) {
  return edge.type === "tight";
}

export function detach(edge) {
  edge.type = null;
}
