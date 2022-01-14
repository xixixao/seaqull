export function invariant(cond) {
  if (!cond) {
    throw new Error("invariant violated");
  }
}
export function warn(cond, message) {
  if (cond) {
    console.error(message);
  }
}
