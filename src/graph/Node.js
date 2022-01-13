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

export function x(appState, node) {
  return position(appState, node).x;
}

export function y(appState, node) {
  return position(appState, node).y;
}

export function move(appState, node, x, y) {
  position(appState, node).x = x;
  position(appState, node).y = y;
}

function position(appState, node) {
  return appState.positions.get(node.id);
}

export function moveBy(appState, node, x, y) {
  position(appState, node).x += x;
  position(appState, node).y += y;
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
