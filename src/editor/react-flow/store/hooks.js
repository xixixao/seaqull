import { bindActionCreators } from "redux";
import {
  useStore as useStoreRedux,
  useSelector,
  useDispatch as reduxUseDispatch,
} from "react-redux";
import { useMemo } from "react";
import * as actions from "./actions";
export const useTypedSelector = useSelector;
export function useStoreActions(actionSelector) {
  const dispatch = reduxUseDispatch();
  const currAction = actionSelector(actions);
  const action = useMemo(() => {
    // this looks weird but required if both ActionSelector and ActionMapObjectSelector are supported
    return typeof currAction === "function"
      ? bindActionCreators(currAction, dispatch)
      : bindActionCreators(currAction, dispatch);
  }, [dispatch, currAction]);
  return action;
}
export const useStoreState = useTypedSelector;
export const useStore = () => {
  const store = useStoreRedux();
  return store;
};
export const useDispatch = reduxUseDispatch;
