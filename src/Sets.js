import * as Arrays from "./Arrays";

export function subtract(a, b) {
  return new Set(Arrays.filter(a, (item) => !b.has(item)));
}