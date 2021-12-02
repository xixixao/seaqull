import React, { memo } from "react";
import Handle from "../../components/Handle";
import { Position } from "../../types";
const InputNode = ({
  data,
  isConnectable,
  sourcePosition = Position.Bottom,
}) => (
  <>
    {data.label}
    <Handle
      type="source"
      position={sourcePosition}
      isConnectable={isConnectable}
    />
  </>
);
InputNode.displayName = "InputNode";
export default memo(InputNode);
