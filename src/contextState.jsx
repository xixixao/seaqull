import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
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
      // let newState = null;

      function next(acc, i, setters) {
        if (setters.length === i) {
          newState.value = updater(acc);
          return;
        }
        const [key, setter] = setters[i];

        setter((value) => {
          if (newState.value != null) {
            return updater({ ...newState.value, [key]: value })[key];
          }
          // console.log(newState, key);
          acc[key] = value;
          next(acc, i + 1, setters);
          if (newState.value == null) {
            console.log("bailing out", key);
            return value;
          }
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

const id = (x) => x;
export function useCombinedContext(contextMap, fn = id) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const values = objectMap(contextMap, (context) => useContext(context));
  return useMemo(
    () => fn(values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(values)
  );
}
