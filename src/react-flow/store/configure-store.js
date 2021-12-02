import { createStore } from "redux";
import reactFlowReducer from "./reducer";
export default function configureStore(preloadedState) {
  const store = createStore(reactFlowReducer, preloadedState);
  return store;
}
