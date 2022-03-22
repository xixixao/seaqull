import { createContext, useContext } from "react";

const SQLResultsContext = createContext();

export const SQLResultsContextProvider = SQLResultsContext.Provider;

export function useSQLResultsContext() {
  return useContext(SQLResultsContext);
}
