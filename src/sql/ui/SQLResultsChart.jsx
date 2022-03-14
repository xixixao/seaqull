import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { memo, useEffect, useRef, useState } from "react";
import { getDimensions } from "seaqull/react-flow/utils";

export const SQLResultsChart = memo(function SQLResultsChart({
  state: { appState, tables },
}) {
  const ref = useRef();
  // const size = useResizeHandler(ref);
  // const results = tables[0];
  const xs = ["2012", "2013", "2014", "2015", "2016"];
  // .map(
  // (year) => new Date(Date.UTC(year))
  // );
  const results = {
    name: "Foo",
    data: [[2], [1], [5], [4], [3]],
  };
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          chart: {
            style: { fontFamily: "inherit" },
          },
          title: { text: "" },
          xAxis: { type: "datetime", categories: xs },
          yAxis: {
            title: {
              text: "",
            },
          },
          series: [results],
          plotOptions: {
            series: {
              marker: {
                enabled: false,
              },
            },
          },
          credits: { enabled: false },
        }}
      />
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
