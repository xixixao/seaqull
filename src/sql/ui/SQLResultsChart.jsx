import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { memo, useEffect, useRef, useState } from "react";
import { getDimensions } from "seaqull/react-flow/utils";
import { Box } from "ui/layout/Box";
import { HighchartsTheme } from "../../chart/HighchartsTheme";

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
    data: [
      [2012, 2],
      [2013, 1],
      [2014, 5],
      [2015, 4],
      [2016, 3],
    ].map(([year, y]) => [+new Date(Date.UTC(year)), y]),
  };
  return (
    <Box
      ref={ref}
      css={{
        width: "100%",
        height: "100%",
        ...HighchartsTheme,
      }}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          chart: {
            // backgroundColor: null,
            styledMode: true,
          },
          title: { text: "" },
          xAxis: {
            type: "datetime",
            // categories: xs,
            crosshair: true,
          },
          yAxis: {
            title: {
              text: "",
            },
          },
          series: [results],
          plotOptions: {
            series: {
              stickyTracking: false,
              marker: {
                enabled: false,
              },
            },
          },
          credits: { enabled: false },
        }}
      />
    </Box>
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
