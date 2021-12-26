import { invariant } from "./invariant";
import * as Iterable from "./Iterable";

export function map(iterable, mapper) {
  return Array.from(Iterable.map(iterable, mapper));
}

export function filter(iterable, cond) {
  return Array.from(Iterable.filter(iterable, cond));
}

export function only(array) {
  return array.length === 1 ? array[0] : null;
}

export function onlyThrows(array) {
  invariant(array.length === 1);
  return array[0];
}
