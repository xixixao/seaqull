import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { initialState } from "../store";
import configureStore from "../store/configure-store";

export function ReactFlowProvider({ children }) {
  const store = useMemo(() => {
    return configureStore(initialState);
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
