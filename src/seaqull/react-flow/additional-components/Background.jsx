import React, { useMemo } from "react";
import { SVG } from "seaqull/react-flow/components/SVG";
import { useStoreState } from "../store/hooks";

export function Background() {
  const [x, y, scale] = useStoreState((s) => s.transform);
  // when there are multiple flows on a page we need to make sure that every background gets its own pattern.
  const patternId = useMemo(
    () => `pattern-${Math.floor(Math.random() * 100000)}`,
    []
  );
  const size = 0.5;
  const gap = 15;
  const scaledGap = gap * scale;
  const xOffset = x % scaledGap;
  const yOffset = y % scaledGap;
  const bgColor = "#81818a";
  const path = createGridDotsPath(size * scale, bgColor);
  return (
    <SVG
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <pattern
        id={patternId}
        x={xOffset}
        y={yOffset}
        width={scaledGap}
        height={scaledGap}
        patternUnits="userSpaceOnUse"
      >
        {path}
      </pattern>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
      />
    </SVG>
  );
}

// const isLines = variant === BackgroundVariant.Lines;
// const bgColor = color ? color : defaultColors[variant];
// const path = isLines
//   ? createGridLinesPath(scaledGap, size, bgColor)
//   : createGridDotsPath(size * scale, bgColor);

// const defaultColors = {
//   [BackgroundVariant.Dots]: "#81818a",
//   [BackgroundVariant.Lines]: "#eee",
// };

// export const createGridLinesPath = (size, strokeWidth, stroke) => {
//   return (
//     <path
//       stroke={stroke}
//       strokeWidth={strokeWidth}
//       d={`M${size / 2} 0 V${size} M0 ${size / 2} H${size}`}
//     />
//   );
// };

function createGridDotsPath(size, fill) {
  return <circle cx={size} cy={size} r={size} fill={fill} />;
}
