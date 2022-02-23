import * as Nodes from "graph/Nodes";
import * as Node from "graph/Node";
import * as Arrays from "js/Arrays";

export function layoutTightStack(graph, node) {
  const { height } = Nodes.positionOf(graph, node);

  const child = Nodes.tightChild(graph, node);
  if (child == null) {
    return;
  }
  Node.move(graph, child, Node.x(graph, node), Node.y(graph, node) + height);
  layoutTightStack(graph, child);
}

export function layoutStandalone(graph, node) {
  const INIT_Y = 30;
  const NODE_HORIZONTAL_OFFSET = 30;

  const maxX = Math.max(
    0,
    ...Arrays.filter(
      Nodes.positions(graph),
      (_, id) => !Node.hasID(node, id)
    ).map(({ x, width }) => x + width)
  );

  Node.move(graph, node, maxX + NODE_HORIZONTAL_OFFSET, INIT_Y);
}

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

export function centerAtPosition(graph, node, position) {
  const { width, height } = Nodes.positionOf(graph, node);
  Node.move(
    graph,
    node,
    Math.floor(position.x - width / 2),
    Math.floor(position.y - height / 2)
  );
}
