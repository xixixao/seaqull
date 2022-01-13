import * as Arrays from "js/Arrays";

export function subtract(a, b) {
  return new Set(Arrays.filter(a, (item) => !b.has(item)));
}
