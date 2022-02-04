export function map(object, fn) {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    newObject[key] = fn(object[key], key);
  });
  return newObject;
}

export function reduce(object, fn, acc) {
  return Object.keys(object).reduce((acc, key) => {
    return fn(acc, object[key], key);
  }, acc);
}

export function fromMap(map) {
  const object = {};
  map.forEach((value, key) => {
    object[key] = value;
  });
  return object;
}

export function fromKeys(keys, fn) {
  const object = {};
  keys.forEach((key, index) => {
    object[key] = fn(key, index);
  });
  return object;
}

export function fromEntries(entries, fn) {
  const object = {};
  entries.forEach(([key, value]) => {
    object[key] = value;
  });
  return object;
}
