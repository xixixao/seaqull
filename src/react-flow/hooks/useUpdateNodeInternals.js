import { useCallback } from "react";
import { useStoreActions } from "../store/hooks";
function useUpdateNodeInternals() {
  // const updateNodeDimensions = useStoreActions(
  //   (actions) => actions.updateNodeDimensions
  // );
  // return useCallback((id) => {
  //   const nodeElement = document.querySelector(
  //     `.react-flow__node[data-id="${id}"]`
  //   );
  //   if (nodeElement) {
  //     updateNodeDimensions([{ id, nodeElement, forceUpdate: true }]);
  //   }
  // }, []);
}
export default useUpdateNodeInternals;
