export function objectMap(object, fn) {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    newObject[key] = fn(object[key], key);
  });
  return newObject;
}

export function objectReduce(object, fn, acc) {
  return Object.keys(object).reduce((acc, key) => {
    return fn(acc, object[key], key);
  }, acc);
}
