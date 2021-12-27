export function* map(iterable, mapper) {
  for (const [key, item] of iterable.entries()) {
    yield mapper(item, key);
  }
}

export function* filter(iterable, cond) {
  for (const [key, item] of iterable.entries()) {
    if (cond(item, key)) {
      yield item;
    }
  }
}
