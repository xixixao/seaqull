import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";

// TODO: `layout` can stay here but the algo should go into a separate module
export function layoutTightStack(graph, node) {
  const { height } = Nodes.positionOf(graph, node);

  Nodes.tightChildren(graph, node).forEach((child) => {
    Node.move(graph, child, Node.x(graph, node), Node.y(graph, node) + height);
    layoutTightStack(graph, child);
  });
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layoutStandalone(graph, node) {
  const INIT_Y = 30;
  const NODE_HORIZONTAL_OFFSET = 30;

  const maxX = Math.max(
    ...Arrays.map(Nodes.positions(graph), ({ x, width }) => x + width)
  );

  Node.move(graph, node, maxX + NODE_HORIZONTAL_OFFSET, INIT_Y);
}

// TODO: `layout` can stay here but the algo should go into a separate module
export function layoutDetached(graph, parents, node) {
  const NODE_HORIZONTAL_OFFSET = 30;

  const maxX = Math.max(
    ...parents
      .map((parent) => Nodes.positionOf(graph, parent))
      .map(({ x, width }) => x + width)
  );
  const maxY = Math.max(
    ...parents
      .map((parent) => Nodes.positionOf(graph, parent))
      .map(({ y, height }) => y + height)
  );

  Node.move(graph, node, maxX + NODE_HORIZONTAL_OFFSET, maxY);
}
