export function empty(name) {
  return { name };
}

export function name(node) {
  return node.data.name;
}

export function setName(node, name) {
  node.data.name = name;
}
