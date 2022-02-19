import { warn } from "js/invariant";
import * as Iterable from "js/Iterable";

export function map(iterable, mapper) {
  return Array.from(Iterable.map(iterable, mapper));
}

export function filter(iterable, cond) {
  return Array.from(Iterable.filter(iterable, cond));
}

export function values(iterable) {
  return Array.from(iterable.values());
}

export function merge(arrays) {
  return [].concat(...arrays);
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

export function reverse(a) {
  const copy = a.slice(0);
  copy.reverse();
  return copy;
}

// TODO: This is used to get optimized patches out of Immer, and should
// be only called on proxies. Whether it has bad performance remains
// to be seen.
export function replace(a, b) {
  a.splice(0);
  a.push(...b);
}
