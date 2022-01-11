import * as Node from "./Node";
import * as Edge from "./Edge";
import * as Edges from "./Edges";
import * as Iterable from "./Iterable";
import * as Arrays from "./Arrays";
import { onlyThrows } from "./Arrays";
import { invariant } from "./invariant";
import { doNodesOverlap } from "./react-flow/utils/graph";

export function select(appState, nodes) {
  appState.selectedNodeIDs = idSet(nodes);
}

export function alsoSelect(appState, nodes) {
  select(
    appState,
    Arrays.map(appState.selectedNodeIDs, Node.fake).concat(nodes)
  );
}

export function countSelected(appState) {
  return appState.selectedNodeIDs.size;
}

export function isSelecting(appState) {
  return appState.selectedNodeIDs.size > 0;
}

export function selected(appState) {
  return nodesWithID(appState, appState.selectedNodeIDs);
}

export function hasSelected(appState, node) {
  return appState.selectedNodeIDs.has(Node.id(node));
}

export function nodesWithID(appState, ids) {
  return Arrays.map(ids, (id) => nodeWithID(appState, id));
}

export function nodeWithID(appState, id) {
  return nodes(appState).get(id);
}

export function current(appState, node) {
  return nodeWithID(appState, Node.id(node));
}

export function positionWithID(appState, id) {
  return positions(appState).get(id);
}

export function positionOf(appState, node) {
  return positions(appState).get(Node.id(node));
}

export function nodes(appState) {
  return appState.nodes;
}

export function newNode(appState, nodeData) {
  return {
    id: newNodeID(appState),
    data: {},
    ...nodeData,
  };
}

export function children(appState, node) {
  return nodesWithID(
    appState,
    Edges.children(appState, node).map((edge) => Edge.childID(edge))
  );
}

export function parents(appState, node) {
  return nodesWithID(
    appState,
    Edges.parents(appState, node).map((edge) => Edge.parentID(edge))
  );
}

export function tightChildren(appState, node) {
  return Edges.tightChildren(appState, node).map((edge) =>
    Edges.childNode(appState, edge)
  );
}

export function parentX(appState, node) {
  return onlyThrows(parents(appState, node));
}

export function hasParents(appState, node) {
  return Edges.parents(appState, node).length > 0;
}

export function hasDetachedParents(appState, node) {
  return Edges.detachedParents(appState, node).length > 0;
}

export function hasChildren(appState, node) {
  return Edges.children(appState, node).length > 0;
}

export function hasTightChildren(appState, node) {
  return Edges.tightChildren(appState, node).length > 0;
}

export function hasDetachedChildren(appState, node) {
  return Edges.detachedChildren(appState, node).length > 0;
}

export function add(appState, node) {
  nodes(appState).set(Node.id(node), node);
  positions(appState).set(Node.id(node), { x: 0, y: 0 });
}

function positions(appState) {
  return appState.positions;
}

// export function replace(appState, old, node) {
//   nodes(appState).set(Node.id(old), node);
// }

export function remove(appState, node) {
  nodes(appState).delete(Node.id(node));
  positions(appState).delete(Node.id(node));
  Edges.removeAll(appState, Edges.of(appState, node));
}

export function tightParent(appState, node) {
  const edge = Edges.tightParent(appState, node);
  return edge != null ? Edges.parentNode(appState, edge) : null;
}

export function tightChild(appState, node) {
  const edge = Arrays.only(Edges.tightChildren(appState, node));
  return edge != null ? Edges.childNode(appState, edge) : null;
}

export function tightStack(appState, node) {
  const stack = [node];
  let last = node;
  while (last != null) {
    const child = tightChild(appState, last);
    if (child != null) {
      stack.push(child);
    }
    last = child;
  }
  return stack;
}

export function sortTight(appState, nodes) {
  const set = idSet(nodes);
  const root = tightRoot(appState, nodes[0]);
  return tightStack(appState, root).filter((node) => set.has(Node.id(node)));
}

export function tightRoot(appState, node) {
  const parent = tightParent(appState, node);
  if (parent == null) {
    return node;
  }
  return tightRoot(appState, parent);
}

export function haveSameTightRoot(appState, a, b) {
  return Node.is(tightRoot(appState, a), tightRoot(appState, b));
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

export function overlappingLeafs(appState, targetNode) {
  const targetPosition = positionOf(appState, targetNode);
  return tightLeafs(appState).filter((node) => {
    const position = positionOf(appState, node);
    return (
      !Node.is(targetNode, node) &&
      doNodesOverlap(position, targetPosition, 20) &&
      !Edges.isAncestor(appState, targetNode, node)
    );
  });
}

function tightLeafs(appState) {
  return Arrays.filter(
    nodes(appState),
    (node) => Edges.tightChildren(appState, node).length === 0
  );
}

// function overlapping(appState, targetNode) {
//   const targetPosition = positionOf(appState, targetNode);
//   return Arrays.filter(nodes(appState), (node) => {
//     const position = positionOf(appState, node);
//     return (
//       !Node.is(node, targetNode) && doNodesOverlap(position, targetPosition, 20)
//     );
//   });
// }

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
export function layout(appState, node) {
  const { height } = positionOf(appState, node);

  tightChildren(appState, node).forEach((child) => {
    Node.move(
      appState,
      child,
      Node.x(appState, node),
      Node.y(appState, node) + height
    );
    layout(appState, child);
  });
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layoutStandalone(appState, node) {
  const INIT_Y = 30;
  const NODE_HORIZONTAL_OFFSET = 30;

  const maxX = Math.max(
    ...Arrays.map(positions(appState), ({ x, width }) => x + width)
  );

  Node.move(appState, node, maxX + NODE_HORIZONTAL_OFFSET, INIT_Y);
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layoutDetached(appState, parents, node) {
  const NODE_HORIZONTAL_OFFSET = 30;

  const maxX = Math.max(
    ...parents
      .map((parent) => positionOf(appState, parent))
      .map(({ x, width }) => x + width)
  );
  const maxY = Math.max(
    ...parents
      .map((parent) => positionOf(appState, parent))
      .map(({ y, height }) => y + height)
  );

  Node.move(appState, node, maxX + NODE_HORIZONTAL_OFFSET, maxY);
}
