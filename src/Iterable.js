export function* map(iterable, mapper) {
  for (const item of iterable.values()) {
    yield mapper(item);
  }
}

export function* filter(iterable, cond) {
  for (const item of iterable.values()) {
    if (cond(item)) {
      yield item;
    }
  }
}
