import React from "react";
export const createGridLinesPath = (size, strokeWidth, stroke) => {
  return (
    <path
      stroke={stroke}
      strokeWidth={strokeWidth}
      d={`M${size / 2} 0 V${size} M0 ${size / 2} H${size}`}
    />
  );
};
export const createGridDotsPath = (size, fill) => {
  return <circle cx={size} cy={size} r={size} fill={fill} />;
};
