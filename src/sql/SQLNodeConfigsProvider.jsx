import { createContext, useContext } from "react";

const SQLNodeConfigsContext = createContext();

export const SQLNodeConfigsProvider = SQLNodeConfigsContext.Provider;

export function useNodeConfigs() {
  return useContext(SQLNodeConfigsContext);
}
