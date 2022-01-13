import React, { memo } from "react";
import Handle from "../Handle";
import { Position } from "../../types";
const OutputNode = ({ data, isConnectable, targetPosition = Position.Top }) => (
  <>
    <Handle
      type="target"
      position={targetPosition}
      isConnectable={isConnectable}
    />
    {data.label}
  </>
);
OutputNode.displayName = "OutputNode";
export default memo(OutputNode);
