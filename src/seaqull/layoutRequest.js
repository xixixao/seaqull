import { createContext, useContext } from "react";

const LayoutRequestContext = createContext();

export const LayourRequestProvider = LayoutRequestContext.Provider;
export function useLayoutRequest() {
  return useContext(LayoutRequestContext);
}
