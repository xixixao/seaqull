import { useEffect } from "react";
import { useStoreActions } from "../../store/hooks";
const ElementUpdater = ({ elements, selectedNodeIDs }) => {
  const setElements = useStoreActions((actions) => actions.setElements);
  useEffect(() => {
    setElements({ elements, selectedNodeIDs });
  }, [elements]);
  return null;
};
export default ElementUpdater;
