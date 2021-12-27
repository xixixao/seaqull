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

export function x(node) {
  return node.position.x;
}

export function y(node) {
  return node.position.y;
}

export function move(node, x, y) {
  node.position.x = x;
  node.position.y = y;
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
