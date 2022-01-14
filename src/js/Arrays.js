import { warn } from "js/invariant";
import * as Iterable from "js/Iterable";

export function map(iterable, mapper) {
  return Array.from(Iterable.map(iterable, mapper));
}

export function filter(iterable, cond) {
  return Array.from(Iterable.filter(iterable, cond));
}

export function subtractSets(a, b) {
  return filter(a, (item) => !b.has(item));
}

export function first(array) {
  return array[0];
}

export function second(array) {
  return array[1];
}

export function last(array) {
  return array[array.length - 1];
}

export function only(array) {
  return array.length === 1 ? array[0] : null;
}

export function onlyWarns(array) {
  warn(array.length !== 1, `Expected one element, got ${array.length}`);
  return array[0];
}

export function isEqual(a, b) {
  return a.length === b.length && a.every((x, i) => b[i] === x);
}
