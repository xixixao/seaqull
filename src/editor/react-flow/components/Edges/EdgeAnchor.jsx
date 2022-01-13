import React from "react";
import cc from "classcat";
import { Position } from "../../types";
const shiftX = (x, shift, position) => {
  if (position === Position.Left) return x - shift;
  if (position === Position.Right) return x + shift;
  return x;
};
const shiftY = (y, shift, position) => {
  if (position === Position.Top) return y - shift;
  if (position === Position.Bottom) return y + shift;
  return y;
};
export const EdgeAnchor = ({
  className,
  position,
  centerX,
  centerY,
  radius = 10,
}) => (
  <circle
    className={cc(["react-flow__edgeupdater", className])}
    cx={shiftX(centerX, radius, position)}
    cy={shiftY(centerY, radius, position)}
    r={radius}
    stroke="transparent"
    fill="transparent"
  />
);
