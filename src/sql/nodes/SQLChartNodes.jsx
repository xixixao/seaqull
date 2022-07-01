import * as Nodes from "graph/Nodes";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { only } from "js/Arrays";
import * as Sets from "js/Sets";
import React from "react";
import Input from "seaqull/Input";
import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import { useSetNodeState } from "seaqull/state";
import { Box } from "ui/layout/Box";
import { HighchartsTheme } from "../..//chart/HighchartsTheme";
import { useAppGraphWithEditorConfig } from "../../sqlite/sqliteState";
import {
  useIsThisOnlySelectedNode,
  useSQLResultsNodeContext,
} from "../results/SQLResults";
import {
  SQLResultsTable,
  SQLResultsTableOrQuery,
} from "../results/SQLResultsTable";
import {
  ResultErrorDisplayBoundary,
  useExecuteSQLQuery,
} from "../results/useExecuteSQLQuery";
import { getColumnNames, getQuery } from "../sqlNodes";
import SQLNodeUI from "../ui/SQLNodeUI";

export const SQLChartNodeConfig = {
  Component: ChartNode,
  emptyNodeData: empty,
  // hasProblem(appState, node) {
  //   return false; // TODO
  // },
  query(appState, node) {
    const sourceNode = only(Nodes.parents(appState, node));
    if (sourceNode == null) {
      return null;
    }
    return getQuery(appState, sourceNode);
  },
  // TODO: This error boundary is a cruth, I implemented for something else
  // before but it's helpful to catch errors in HighCharts which blow up the
  // tree
  Results() {
    const isThisOnlySelectedNode = useIsThisOnlySelectedNode();
    if (isThisOnlySelectedNode) {
      return (
        <>
          <ResultErrorDisplayBoundary>
            <SQLResultsChart />
          </ResultErrorDisplayBoundary>
          <SQLResultsTable getQuery={getQuery} />
        </>
      );
    }

    return (
      <ResultErrorDisplayBoundary>
        <SQLResultsChart />
      </ResultErrorDisplayBoundary>
    );
  },
};

function ChartNode() {
  return (
    <SQLNodeUI parentLimit={1}>
      <DimensionInput />
      <BreakdownInput />
      <SeriesInput />
      <ChartTypeInput />
    </SQLNodeUI>
  );
}

function DimensionInput() {
  const node = useNode();
  const appState = useAppGraphWithEditorConfig();
  const setNodeState = useSetNodeState(node);
  const defaultDimension = dimensionDefault(appState, node) ?? "∅";
  return (
    <Box>
      BY{" "}
      <Input
        emptyDisplayValue={defaultDimension}
        emptyDisplayValueColor="$slate11"
        value={dimension(node)}
        onChange={(selected) => {
          setNodeState((node) => {
            setDimension(node, selected);
          });
        }}
      />
    </Box>
  );
}

function BreakdownInput() {
  const node = useNode();
  const setNodeState = useSetNodeState(node);
  return (
    <Box>
      BREAK DOWN BY{" "}
      <Input
        emptyDisplayValue="∅"
        emptyDisplayValueColor="$slate11"
        value={breakdowns(node)}
        onChange={(selected) => {
          setNodeState((node) => {
            setBreakdowns(node, selected);
          });
        }}
      />
    </Box>
  );
}

function SeriesInput() {
  const node = useNode();
  const appState = useAppGraphWithEditorConfig();
  const setNodeState = useSetNodeState(node);

  const defaultMetric = metricDefault(appState, node) ?? "∅";
  return (
    <Box>
      SHOW{" "}
      <Input
        emptyDisplayValue={defaultMetric}
        emptyDisplayValueColor="$slate11"
        value={metrics(node)}
        onChange={(selected) => {
          setNodeState((node) => {
            setMetrics(node, selected);
          });
        }}
      />
    </Box>
  );
}

function ChartTypeInput() {
  const node = useNode();
  const setNodeState = useSetNodeState(node);
  const defaultChartType = useInferChartType(node);
  return (
    <Box>
      AS{" "}
      <Input
        emptyDisplayValue={defaultChartType}
        emptyDisplayValueColor="$slate11"
        value={chartType(node)}
        onChange={(selected) => {
          setNodeState((node) => {
            setChartType(node, selected);
          });
        }}
      />
    </Box>
  );
}

function SQLResultsChart() {
  const { appState, node } = useSQLResultsNodeContext();
  const state = useExecuteSQLQuery(getQuery);
  // const ref = useRef();
  if (state == null) {
    return null;
  }
  if (state.error) {
    return state.error;
  }
  const { columns, values } = state.table;

  // const size = useResizeHandler(ref);

  const xAxis = getXAxis(appState, node, { columns, values });
  console.log(xAxis);
  if (xAxis == null) {
    return `\`${defaultedDimension(appState, node)}\` is not a valid column`;
  }
  const series = [
    {
      name: columns[1],
      data: values.map(([x, y]) => [xAxis.parse(x), y]),
    },
  ];
  console.log(series);
  // const categories = null; // values.map((row) => row[0]);
  // TODO: Bar chart should include values inside the bars
  // and should be scrollable if there are too many values
  const { css, ...options } = (
    chartType(node) === "" || chartType(node) === "Line chart"
      ? lineChartOptions
      : barChartOptions
  )({ xAxis, series }, node);
  return (
    <Box
      css={{
        width: "100%",
        height: "100%",
        paddingTop: "$8",
        position: "sticky",
        top: 0,
        ...HighchartsTheme,
        ...css,
      }}
    >
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Box>
  );
}

function barChartOptions({ xAxis, series }, node) {
  return chartOptions({
    series,
    css: {
      ".highcharts-xaxis .highcharts-axis-line": {
        stroke: "transparent",
      },
      ".highcharts-xaxis-grid .highcharts-grid-line": {
        strokeWidth: 1,
        strokeDasharray: [1, 1],
      },
      ".highcharts-xaxis .highcharts-tick": {
        strokeWidth: 1,
        strokeDasharray: [1, 1],
        stroke: "$$gridColor",
      },
    },
    xAxis: {
      ...xAxis,
      tickWidth: 1,
    },
    chart: {
      height: series[0].data.length * 32,
      type: "bar",
    },
    legend: {
      verticalAlign: "top",
      enabled: breakdowns(node) !== "",
    },
    yAxis: {
      visible: false,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          inside: true,
          align: "left",
          // color: "#FFFFFF",
        },
      },
    },
  });
}

function lineChartOptions({ xAxis, series }) {
  return chartOptions({
    series,
    xAxis,
    chart: {
      type: "line",
    },
  });
}

function chartOptions({ chart, xAxis, yAxis, plotOptions, ...rest }) {
  return {
    chart: {
      // backgroundColor: null,
      styledMode: true,
      ...chart,
    },
    title: { text: "" },
    xAxis: {
      // categories,
      crosshair: true,
      ...xAxis,
    },
    yAxis: {
      title: {
        text: "",
      },
      ...yAxis,
    },
    tooltip: {
      headerFormat: xAxis.name + ": <b>{point.key}</b><br/>",
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        marker: {
          enabled: false,
        },
        animation: false,
      },
      ...plotOptions,
    },
    credits: { enabled: false },
    ...rest,
  };
}

function dimensionIndex(appState, node, columns) {
  const name = defaultedDimension(appState, node);
  return columns.findIndex((column) => column === name);
}

function defaultedDimension(appState, node) {
  const chosenDimension = dimension(node);
  return chosenDimension !== ""
    ? chosenDimension
    : dimensionDefault(appState, node);
}

function getXAxis(appState, node, { columns, values }) {
  const index = dimensionIndex(appState, node, columns);
  if (index === -1) {
    return null;
  }
  const isDates = isDateLike(values[index][0]);
  const isNumerical = !isNaN(parseInt(values[index][0]));
  const type = isDates ? "datetime" : isNumerical ? "linear" : "category";
  const parse = isDates ? (x) => Date.parse(x) : (x) => x;
  return { type, parse, name: columns[index] };
}

function isDateLike(string) {
  return (
    /(^\d{1,4}[.|\\/|-]\d{1,2}[.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?/.test(
      string
    ) && !isNaN(Date.parse(string))
  );
}

function useInferChartType(dimension, breakdowns, metrics) {
  // const state = useExecuteSQLQuery(getQuery);
  const state = null;

  // TODO
  if (state == null) {
    return "Line chart";
  }
  const { table } = state;
  if (isTimeLike(table, dimension)) {
    return "Line chart";
  }
  return "Bar chart";
}

function isTimeLike({ columns, values }, column) {
  const columnIndex = columns.findIndex((name) => name === column);
  if (columnIndex === -1) {
    return false;
  }
  return isDateLike(values[columnIndex][0]);
}

function empty() {
  return { dimension: "", breakdowns: "", metrics: "", chartType: "" };
}

function dimension(node) {
  return node.data.dimension;
}

function dimensionDefault(appState, node) {
  const parent = only(Nodes.parents(appState, node));
  return parent != null ? Sets.first(getColumnNames(appState, parent)) : null;
}

function breakdowns(node) {
  return node.data.breakdowns;
}

function metrics(node) {
  return node.data.metrics;
}

function metricDefault(appState, node) {
  const parent = only(Nodes.parents(appState, node));
  return parent != null ? Sets.second(getColumnNames(appState, parent)) : null;
}

function chartType(node) {
  return node.data.chartType;
}

function setDimension(node, dimension) {
  node.data.dimension = dimension;
}

function setBreakdowns(node, breakdowns) {
  node.data.breakdowns = breakdowns;
}

function setMetrics(node, metrics) {
  node.data.metrics = metrics;
}

function setChartType(node, chartType) {
  node.data.chartType = chartType;
}
