import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";
import { Box } from "ui/layout/Box";
import { HighchartsTheme } from "../../chart/HighchartsTheme";
import { getQuery } from "../sqlNodes";
import { useExecuteSQLQuery } from "./useExecuteSQLQuery";

export function SQLResultsChart({ appState, node }) {
  const state = useExecuteSQLQuery(appState, node, getQuery);
  const ref = useRef();
  if (state == null) {
    return null;
  }
  if (state.error) {
    return state.error;
  }
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
        paddingTop: "$8",
        position: "sticky",
        top: 0,
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
              animation: false,
            },
          },
          credits: { enabled: false },
        }}
      />
    </Box>
  );
}

// function useResizeHandler(ref) {
//   const [size, setSize] = useState({ width: 0, height: 0 });
//   useEffect(() => {
//     let resizeObserver;
//     const updateDimensions = () => {
//       const size = getDimensions(ref.current);
//       setSize(size);
//     };
//     updateDimensions();
//     window.onresize = updateDimensions;
//     const node = ref.current;
//     resizeObserver = new ResizeObserver(() => updateDimensions());
//     resizeObserver.observe(node);
//     return () => {
//       window.onresize = null;
//       resizeObserver.unobserve(node);
//     };
//   }, [ref]);
//   return size;
// }
