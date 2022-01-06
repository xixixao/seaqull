import { createContext } from "react";

export function createStrictContext<T>(): Context<T> {
  return createContext(undefined);
}
