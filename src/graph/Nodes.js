import { hasTargetHandle } from "editor/react-flow/components/Handle/handler";
import * as Arrays from "js/Arrays";
import * as Sets from "js/Sets";
import { doNodesOverlap } from "../editor/react-flow/utils/graph";
import * as Edge from "./Edge";
import * as Edges from "./Edges";
import * as Node from "./Node";

export function select(graph, nodes) {
  Sets.replace(graph.lastSelectedNodeIDs, graph.selectedNodeIDs);
  Sets.replace(graph.selectedNodeIDs, idSet(nodes));
}

export function alsoSelect(graph, nodes) {
  select(graph, Arrays.map(graph.selectedNodeIDs, Node.fake).concat(nodes));
}

export function countSelected(graph) {
  return graph.selectedNodeIDs.size;
}

export function isSelecting(graph) {
  return graph.selectedNodeIDs.size > 0;
}

export function selected(graph) {
  return nodesWithID(graph, graph.selectedNodeIDs);
}

export function lastSelected(graph) {
  return nodesWithID(graph, graph.lastSelectedNodeIDs);
}

export function hasSelected(graph, node) {
  return graph.selectedNodeIDs.has(Node.id(node));
}

export function wasOnlySelected(graph, node) {
  const lastOnlySelected = Arrays.only(lastSelected(graph));
  if (lastOnlySelected == null) {
    return false;
  }
  return Node.is(lastOnlySelected, node);
}

export function all(graph) {
  return Array.from(nodes(graph).values());
}

export function nodesWithID(graph, ids) {
  return Arrays.map(ids, (id) => nodeWithID(graph, id));
}

export function nodeWithID(graph, id) {
  return nodes(graph).get(id);
}

export function current(graph, node) {
  return nodeWithID(graph, Node.id(node));
}

export function isDeleted(graph, node) {
  return current(graph, node) == null;
}

export function currents(graph, nodes) {
  return nodesWithID(graph, nodes.map(Node.id));
}

export function positionWithID(graph, id) {
  return positions(graph).get(id);
}

export function positionOf(graph, node) {
  return positions(graph).get(Node.id(node));
}

export function positionsOf(graph, nodes) {
  return new Map(
    nodes.map((node) => [
      Node.id(node),
      Node.positionOnly(positions(graph).get(Node.id(node))),
    ])
  );
}

export function nodes(graph) {
  return graph.nodes;
}

export function newNode(graph, nodeData) {
  return {
    id: newNodeID(graph),
    data: {},
    ...nodeData,
  };
}

export function replicateNode(graph, node) {
  return {
    ...node,
    id: newNodeID(graph),
  };
}

export function replaceNode(graph, node, nodeData) {
  node.type = nodeData.type;
  node.data = nodeData.data ?? {};
}

export function children(graph, node) {
  return nodesWithID(
    graph,
    Edges.children(graph, node).map((edge) => Edge.childID(edge))
  );
}

export function parents(graph, node) {
  return nodesWithID(
    graph,
    Edges.parents(graph, node).map((edge) => Edge.parentID(edge))
  );
}

export function parentsOrdered(graph, node) {
  return Edges.parentsOrdered(graph, node).map((edge) =>
    Edges.parentNode(graph, edge)
  );
}

export function hasParents(graph, node) {
  return Edges.parents(graph, node).length > 0;
}

export function hasOnlyParent(graph, node) {
  return Edges.parents(graph, node).length === 1;
}

export function hasDetachedParents(graph, node) {
  return Edges.detachedParents(graph, node).length > 0;
}

export function hasChildren(graph, node) {
  return Edges.children(graph, node).length > 0;
}

export function hasTightParent(graph, node) {
  return Edges.tightParent(graph, node) != null;
}

export function hasTightChild(graph, node) {
  return Edges.tightChild(graph, node) != null;
}

export function hasDetachedChildren(graph, node) {
  return Edges.detachedChildren(graph, node).length > 0;
}

export function add(graph, node) {
  nodes(graph).set(Node.id(node), node);
  positions(graph).set(Node.id(node), { x: 0, y: 0 });
}

export function positions(graph) {
  return graph.positions;
}

// export function replace(graph, old, node) {
//   nodes(graph).set(Node.id(old), node);
// }

export function remove(graph, node) {
  nodes(graph).delete(Node.id(node));
  positions(graph).delete(Node.id(node));
  Edges.removeAll(graph, Edges.of(graph, node));
}

export function tightParent(graph, node) {
  const edge = Edges.tightParent(graph, node);
  return edge != null ? Edges.parentNode(graph, edge) : null;
}

export function tightChild(graph, node) {
  const edge = Edges.tightChild(graph, node);
  return edge != null ? Edges.childNode(graph, edge) : null;
}

export function moveTightChild(graph, from, to) {
  const child = tightChild(graph, from);
  if (child != null) {
    Edges.remove(graph, Edges.tightChild(graph, from));
    Edges.addTightChild(graph, to, child);
  }
}

export function tightStack(graph, node) {
  const stack = [node];
  let last = node;
  while (last != null) {
    const child = tightChild(graph, last);
    if (child != null) {
      stack.push(child);
    }
    last = child;
  }
  return stack;
}

export function sortTight(graph, nodes) {
  const set = idSet(nodes);
  const root = tightRoot(graph, nodes[0]);
  return tightStack(graph, root).filter((node) => set.has(Node.id(node)));
}

export function tightRoot(graph, node) {
  const parent = tightParent(graph, node);
  if (parent == null) {
    return node;
  }
  return tightRoot(graph, parent);
}

export function haveSameTightRoot(graph, a, b) {
  return Node.is(tightRoot(graph, a), tightRoot(graph, b));
}

export function idSet(nodes) {
  return new Set(nodes.map(Node.id));
}

export function dedupe(nodes) {
  return Array.from(new Set(nodes));
}

export function groupBy(nodes, groupper) {
  const grouped = new Map();
  nodes.forEach((node) => {
    const key = Node.id(groupper(node));
    const group = grouped.get(key) ?? [];
    group.push(node);
    grouped.set(key, group);
  });
  return Array.from(grouped.values());
}

export function overlappingLeafs(graph, targetNode, event) {
  if (!hasTargetHandle(targetNode, event)) {
    return false;
  }
  const targetPosition = positionOf(graph, targetNode);
  return tightLeafs(graph).filter((node) => {
    const position = positionOf(graph, node);
    return (
      !Node.is(targetNode, node) &&
      doNodesOverlap(position, targetPosition, 20) &&
      !Edges.isAncestor(graph, targetNode, node)
    );
  });
}

export function tightLeafs(graph) {
  return Arrays.filter(
    nodes(graph),
    (node) => Edges.tightChild(graph, node) == null
  );
}

// function overlapping(graph, targetNode) {
//   const targetPosition = positionOf(graph, targetNode);
//   return Arrays.filter(nodes(graph), (node) => {
//     const position = positionOf(graph, node);
//     return (
//       !Node.is(node, targetNode) && doNodesOverlap(position, targetPosition, 20)
//     );
//   });
// }

// const GENERATED_NAMES = "abcdefghijklmnopqrstuvwxyz".split("");

// export function ensureLabel(graph, node) {
//   if (Node.label(node) == null || Node.label(node) === "") {
//     const usedNames = new Set(Iterable.map(nodes(graph), Node.label));
//     const generatedName = GENERATED_NAMES.filter(
//       (name) => !usedNames.has(name)
//     )[0];
//     invariant(generatedName != null);
//     Node.setLabel(node, generatedName);
//   }
// }

function newNodeID(graph) {
  return String(
    Math.max(0, ...Arrays.map(nodes(graph), (node) => Node.intID(node))) + 1
  );
}
