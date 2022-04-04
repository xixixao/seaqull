import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";
import { Box } from "ui/layout/Box";
import { HighchartsTheme } from "../../chart/HighchartsTheme";
import { getQuery } from "../sqlNodes";
import { useExecuteSQLQuery } from "./useExecuteSQLQuery";

export function SQLResultsChart() {
  const state = useExecuteSQLQuery(getQuery);
  const ref = useRef();
  if (state == null) {
    return null;
  }
  if (state.error) {
    return state.error;
  }
  const { columns, values } = state.table;

  // const size = useResizeHandler(ref);

  // For now we're gonna assume that first column contains x values
  // and second column contains y values
  const xAxis = getXAxis({ columns, values });
  const series = [
    {
      name: columns[1],
      data: values.map(([x, y]) => [xAxis.parse(x), y]),
    },
  ];
  const xAxisName = columns[0];
  const categories = null; // values.map((row) => row[0]);
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
            type: xAxis.type,
            categories,
            crosshair: true,
          },
          yAxis: {
            title: {
              text: "",
            },
          },
          tooltip: {
            headerFormat: xAxisName + ": <b>{point.key}</b><br/>",
          },
          series,
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

function getXAxis({ columns, values }) {
  const isDates = isDateLike(values[0][0]);
  const isNumerical = !isNaN(parseInt(values[0][0]));
  const type = isDates ? "datetime" : isNumerical ? "linear" : "category";
  const parse = isDates ? (x) => Date.parse(x) : (x) => x;
  return { type, parse };
}

function isDateLike(string) {
  return (
    /(^\d{1,4}[.|\\/|-]\d{1,2}[.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?/.test(
      string
    ) && !isNaN(Date.parse(string))
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
