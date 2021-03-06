import React, { memo, useRef, useState, useEffect } from "react";
import cc from "classcat";
const EdgeText = ({
  x,
  y,
  label,
  labelStyle = {},
  labelShowBg = true,
  labelBgStyle = {},
  labelBgPadding = [2, 4],
  labelBgBorderRadius = 2,
  children,
  className,
  ...rest
}) => {
  const edgeRef = useRef(null);
  const [edgeTextBbox, setEdgeTextBbox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // ".react-flow__edge-textwrapper": {
  //   pointerEvents: "all",
  // },
  const edgeTextClasses = cc(["react-flow__edge-textwrapper", className]);
  useEffect(() => {
    if (edgeRef.current) {
      const textBbox = edgeRef.current.getBBox();
      setEdgeTextBbox({
        x: textBbox.x,
        y: textBbox.y,
        width: textBbox.width,
        height: textBbox.height,
      });
    }
  }, [label]);
  if (typeof label === "undefined" || !label) {
    return null;
  }
  return (
    <g
      transform={`translate(${x - edgeTextBbox.width / 2} ${
        y - edgeTextBbox.height / 2
      })`}
      className={edgeTextClasses}
      {...rest}
    >
      {labelShowBg && (
        <rect
          width={edgeTextBbox.width + 2 * labelBgPadding[0]}
          x={-labelBgPadding[0]}
          y={-labelBgPadding[1]}
          height={edgeTextBbox.height + 2 * labelBgPadding[1]}
          className="react-flow__edge-textbg"
          style={labelBgStyle}
          rx={labelBgBorderRadius}
          ry={labelBgBorderRadius}
        />
      )}
      <text
        // ".react-flow__edge-text": {
        //   pointerEvents: "none",
        //   userSelect: "none",
        // },
        className="react-flow__edge-text"
        y={edgeTextBbox.height / 2}
        dy="0.3em"
        ref={edgeRef}
        style={labelStyle}
      >
        {label}
      </text>
      {children}
    </g>
  );
};
export default memo(EdgeText);
