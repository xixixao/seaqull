import { createContext, useCallback, useContext, useState } from "react";
import { objectMap, objectReduce } from "./objectMap";

export function createContextState(defaults) {
  const stateContextMap = objectMap(defaults, (value) => createContext(value));
  const setterContextMap = objectMap(defaults, () => createContext());

  const Providers = objectMap(stateContextMap, (_, key) => {
    const component = ({ defaultValue, children }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [value, setValue] = useState(defaultValue);

      const ValueProvider = stateContextMap[key].Provider;
      const SetterProvider = setterContextMap[key].Provider;
      return (
        <ValueProvider value={value}>
          <SetterProvider value={setValue}>{children}</SetterProvider>
        </ValueProvider>
      );
    };
    component.displayName = `Provider_${key}`;
    return component;
  });

  function ContextStateProvider({ initialState, children }) {
    return objectReduce(
      Providers,
      (acc, Provider, key) => {
        return <Provider defaultValue={initialState[key]}>{acc}</Provider>;
      },
      children
    );
  }

  function useCombinedSetter() {
    const setters = objectMap(setterContextMap, (setterContext) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useContext(setterContext)
    );
    return useCallback((updater) => {
      let newState = { value: null, id: Math.random() };

      function next(acc, i, setters) {
        if (setters.length === i) {
          newState.value = updater(acc);
          return;
        }
        const [key, setter] = setters[i];

        setter((value) => {
          acc[key] = value;
          next(acc, i + 1, setters);
          return newState.value[key];
        });
      }

      next({}, 0, Object.entries(setters));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  }

  return {
    state: stateContextMap,
    useCombinedSetter,
    provider: ContextStateProvider,
  };
}
