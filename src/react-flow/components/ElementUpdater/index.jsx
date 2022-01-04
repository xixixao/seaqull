import { useEffect } from "react";
import { useStoreActions } from "../../store/hooks";
const ElementUpdater = ({ elements, selectedNodeIDs }) => {
  const setElements = useStoreActions((actions) => actions.setElements);
  console.log("wtf?", JSON.stringify(elements[1]?.position, null, 2));
  useEffect(() => {
    // console.log(elements);
    setElements({ elements, selectedNodeIDs });
  }, [elements]);
  return null;
};
export default ElementUpdater;
