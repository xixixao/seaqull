import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { memo } from "react";
import { getDimensions } from "seaqull/react-flow/utils";
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { VictoryTheme } from "../../chart/VictoryTheme";

export const SQLResultsChart = memo(function SQLResultsChart({
  state: { appState, tables },
}) {
  const ref = useRef();
  const size = useResizeHandler(ref);
  // const results = tables[0];
  const results = {
    values: [
      ["2012", 2],
      ["2013", 1],
      ["2014", 5],
      ["2015", 4],
      ["2016", 3],
    ],
  };
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <VictoryChart
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => datum[0] + "\n" + datum[1]}
          />
        }
        domainPadding={20}
        theme={VictoryTheme}
        scale={{ x: "time" }}
        width={size.width}
        height={size.height}
      >
        <VictoryAxis />
        <VictoryAxis dependentAxis />
        <VictoryLine
          data={results.values}
          x={([date]) => new Date(date)}
          y={1}
        />
      </VictoryChart>
    </div>
  );
});

function useResizeHandler(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    let resizeObserver;
    const updateDimensions = () => {
      const size = getDimensions(ref.current);
      setSize(size);
    };
    updateDimensions();
    window.onresize = updateDimensions;
    const node = ref.current;
    resizeObserver = new ResizeObserver(() => updateDimensions());
    resizeObserver.observe(node);
    return () => {
      window.onresize = null;
      resizeObserver.unobserve(node);
    };
  }, [ref]);
  return size;
}
