import { useEffect } from "react";
import { useStoreState } from "../../store/hooks";
// This is a helper component for calling the onSelectionChange listener
export default ({ onSelectionChange }) => {
  const selectedElements = useStoreState((s) => s.selectedElements);
  useEffect(() => {
    onSelectionChange(selectedElements);
  }, [selectedElements]);
  return null;
};
