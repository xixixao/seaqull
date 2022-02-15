export function intID(node) {
  return +id(node);
}

export function is(a, b) {
  return id(a) === id(b);
}

export function hasID(node, identifier) {
  return id(node) === identifier;
}

export function id(node) {
  return node.id;
}

export function fake(id) {
  return { id };
}

export function x(graph, node) {
  return position(graph, node).x;
}

export function y(graph, node) {
  return position(graph, node).y;
}

export function move(graph, node, x, y) {
  position(graph, node).x = x;
  position(graph, node).y = y;
}

function position(graph, node) {
  return graph.positions.get(node.id);
}

export function positionOnly({ x, y }) {
  return { x, y };
}

export function moveBy(graph, node, x, y) {
  position(graph, node).x += x;
  position(graph, node).y += y;
}

export function label(node, label) {
  return node.data.label;
}

export function setLabel(node, label) {
  node.data.label = label;
}

export function isTight(node) {
  // Think about how to make this colocated with type config, not randomly here
  return node.type !== "from";
}
