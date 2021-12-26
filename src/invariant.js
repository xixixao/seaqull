export function invariant(cond) {
  if (!cond) {
    throw new Error("invariant violated");
  }
}
