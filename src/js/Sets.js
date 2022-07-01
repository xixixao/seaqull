import * as Arrays from "js/Arrays";

export function subtract(a, b) {
  return new Set(Arrays.subtractSets(a, b));
}

export function first(a) {
  return Array.from(a)[0];
}

export function second(a) {
  return Array.from(a)[1];
}

// TODO: This is used to get optimized patches out of Immer, and should
// be only called on proxies. Whether it has bad performance remains
// to be seen.
export function replace(a, b) {
  Array.from(a).forEach((x) => {
    a.delete(x);
  });
  b.forEach((x) => {
    a.add(x);
  });
}
