import React from "react";
import { Position } from "../../types";
import { styled } from "seaqull/style";

export const EdgeAnchor = ({ position, centerX, centerY, radius = 10 }) => (
  <Circle
    css={{
      cursor: "move",
      pointerEvents: "all",
    }}
    cx={shiftX(centerX, radius, position)}
    cy={shiftY(centerY, radius, position)}
    r={radius}
    stroke="transparent"
    fill="transparent"
  />
);

const Circle = styled("circle");

const shiftX = (x, shift, position) => {
  if (position === Position.Left) {
    return x - shift;
  }
  if (position === Position.Right) {
    return x + shift;
  }
  return x;
};

const shiftY = (y, shift, position) => {
  if (position === Position.Top) {
    return y - shift;
  }
  if (position === Position.Bottom) {
    return y + shift;
  }
  return y;
};
