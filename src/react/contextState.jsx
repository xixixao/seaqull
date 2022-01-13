import { createContext, useContext, useMemo, useState } from "react";
import * as Objects from "js/Objects";

export function createContextState(defaults) {
  const stateContextMap = Objects.map(defaults, (value) =>
    createContext(value)
  );
  const SetterContext = createContext();

  function ContextStateProvider({ initialState, children }) {
    const [state, setState] = useState({ ...defaults, ...initialState });
    return (
      <SetterContext.Provider value={setState}>
        {Objects.reduce(
          stateContextMap,
          (acc, Context, key) => {
            return (
              <Context.Provider value={state[key]}>{acc}</Context.Provider>
            );
          },
          children
        )}
      </SetterContext.Provider>
    );
  }

  return {
    state: stateContextMap,
    setter: SetterContext,
    provider: ContextStateProvider,
  };
}

const id = (x) => x;
export function useCombinedContext(contextMap, fn = id) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const values = Objects.map(contextMap, (context) => useContext(context));
  return useMemo(
    () => fn(values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(values)
  );
}
