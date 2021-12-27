export function empty() {
  return { name: null };
}

export function name(node) {
  return node.data.name;
}

export function setName(node, name) {
  node.data.name = name;
}
