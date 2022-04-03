export const HighchartsTheme = {
  $$gridColor: "$colors$slate5",
  $$crosshairColor: "$colors$slate11",
  $$axisColor: "$colors$slate9",

  ".highcharts-color-0": {
    fill: "$blue9",
    stroke: "$blue9",
  },
  ".highcharts-color-1": {
    fill: "$grass9",
    stroke: "$grass9",
  },
  ".highcharts-color-2": {
    fill: "$pink9",
    stroke: "$pink9",
  },
  ".highcharts-color-3": {
    fill: "$yellow9",
    stroke: "$yellow9",
  },

  ".highcharts-container": {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    textAlign: "left",
    lineHeight: "normal",
    zIndex: 0,
    WebkitTapHighlightColor: "rgba(0,0,0,0)",
    fontFamily: "inherit",
    fontSize: "12px",
  },
  ".highcharts-root": { display: "block" },
  ".highcharts-root text": { strokeWidth: 0, fill: "currentColor" },
  ".highcharts-strong": { fontWeight: "bold" },
  ".highcharts-emphasized": { fontStyle: "italic" },
  ".highcharts-anchor": { cursor: "pointer" },
  ".highcharts-background": { fill: "none" },
  ".highcharts-plot-border, .highcharts-plot-background": { fill: "none" },
  ".highcharts-label-box": { fill: "none" },
  ".highcharts-button-box": { fill: "inherit" },
  ".highcharts-tracker-line": {
    strokeLinejoin: "round",
    stroke: "rgba(192, 192, 192, 0.0001)",
    strokeWidth: 22,
    fill: "none",
  },
  ".highcharts-tracker-area": {
    fill: "rgba(192, 192, 192, 0.0001)",
    strokeWidth: 0,
  },
  ".highcharts-title": {
    // TODO
    // fill: "$neutral-color-80",
    // TODO
    // fontSize: "$title-font-size",
  },
  // TODO
  ".highcharts-subtitle": { fill: "$neutral-color-60" },
  ".highcharts-axis-line": { fill: "none", stroke: "$$axisColor" },
  ".highcharts-yaxis .highcharts-axis-line": { strokeWidth: 0 },
  ".highcharts-axis-title": { fill: "$neutral-color-60" },
  ".highcharts-axis-labels": {
    fill: "$neutral-color-60",
    cursor: "default",
    fontSize: "$axis-labels-font-size",
  },
  ".highcharts-grid-line": { fill: "none", stroke: "$$gridColor" },
  ".highcharts-xaxis-grid .highcharts-grid-line": {
    strokeWidth: 0,
  },
  ".highcharts-tick": { stroke: "$$axisColor" },
  ".highcharts-yaxis .highcharts-tick": { strokeWidth: 0 },
  // ".highcharts-minor-grid-line": { stroke: "$neutral-color-5" },
  ".highcharts-crosshair-thin": {
    strokeWidth: "1px",
    stroke: "$$crosshairColor",
  },
  ".highcharts-crosshair-category": {
    stroke: "$$axisColor",
    strokeOpacity: 0.25,
  },
  ".highcharts-credits": {
    cursor: "pointer",
    fill: "$neutral-color-40",
    fontSize: "0.7em",
    transition: "fill 250ms, font-size 250ms",
  },
  ".highcharts-credits:hover": { fill: "black", fontSize: "1em" },
  ".highcharts-tooltip": {
    cursor: "default",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    transition: "stroke 150ms",
  },
  ".highcharts-tooltip text": { fill: "$neutral-color-80" },
  ".highcharts-tooltip .highcharts-header": { fontSize: "0.85em" },
  ".highcharts-tooltip-box": {
    strokeWidth: "$tooltip-border",
    fill: "$loContrast",
    // fillOpacity: 0.85,
  },
  ".highcharts-tooltip-box .highcharts-label-box": {
    fill: "$loContrast",
    fillOpacity: 0.85,
  },
  ".highcharts-selection-marker": {
    fill: "$highlight-color-80",
    fillOpacity: 0.25,
  },
  ".highcharts-graph": {
    fill: "none",
    strokeWidth: "1.7px",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  ".highcharts-state-hover .highcharts-graph": { strokeWidth: 3 },
  ".highcharts-state-hover path": { transition: "stroke-width 50" },
  ".highcharts-state-normal path": { transition: "stroke-width 250ms" },
  "g.highcharts-series,\n.highcharts-point,\n.highcharts-markers,\n.highcharts-data-labels":
    {
      transition: "opacity 250ms",
    },
  ".highcharts-legend-series-active g.highcharts-series:not(.highcharts-series-hover),\n.highcharts-legend-point-active .highcharts-point:not(.highcharts-point-hover),\n.highcharts-legend-series-active .highcharts-markers:not(.highcharts-series-hover),\n.highcharts-legend-series-active .highcharts-data-labels:not(.highcharts-series-hover)":
    {
      opacity: 0.2,
    },
  ".highcharts-area": { fillOpacity: 0.75, strokeWidth: 0 },
  ".highcharts-markers": { strokeWidth: "1px", stroke: "$background-color" },
  ".highcharts-point": { strokeWidth: "1px" },
  ".highcharts-dense-data .highcharts-point": { strokeWidth: 0 },
  ".highcharts-data-label": { fontSize: "0.9em", fontWeight: "bold" },
  ".highcharts-data-label-box": { fill: "none", strokeWidth: 0 },
  ".highcharts-data-label text, text.highcharts-data-label": {
    fill: "$data-label-color",
  },
  ".highcharts-data-label-connector": { fill: "none" },
  ".highcharts-halo": { fillOpacity: 0.25, strokeWidth: 0 },
  ".highcharts-series:not(.highcharts-pie-series) .highcharts-point-select": {
    fill: "$neutral-color-20",
    stroke: "$neutral-color-100",
  },
  ".highcharts-column-series rect.highcharts-point": {
    stroke: "$background-color",
  },
  ".highcharts-column-series .highcharts-point": {
    transition: "fill-opacity 250ms",
  },
  ".highcharts-column-series .highcharts-point-hover": {
    fillOpacity: 0.75,
    transition: "fill-opacity 50ms",
  },
  ".highcharts-pie-series .highcharts-point": {
    strokeLinejoin: "round",
    stroke: "$background-color",
  },
  ".highcharts-pie-series .highcharts-point-hover": {
    fillOpacity: 0.75,
    transition: "fill-opacity 50ms",
  },
  ".highcharts-funnel-series .highcharts-point": {
    strokeLinejoin: "round",
    stroke: "$background-color",
  },
  ".highcharts-funnel-series .highcharts-point-hover": {
    fillOpacity: 0.75,
    transition: "fill-opacity 50ms",
  },
  ".highcharts-funnel-series .highcharts-point-select": {
    fill: "inherit",
    stroke: "inherit",
  },
  ".highcharts-pyramid-series .highcharts-point": {
    strokeLinejoin: "round",
    stroke: "$background-color",
  },
  ".highcharts-pyramid-series .highcharts-point-hover": {
    fillOpacity: 0.75,
    transition: "fill-opacity 50ms",
  },
  ".highcharts-pyramid-series .highcharts-point-select": {
    fill: "inherit",
    stroke: "inherit",
  },
  ".highcharts-solidgauge-series .highcharts-point": { strokeWidth: 0 },
  ".highcharts-treemap-series .highcharts-point": {
    strokeWidth: "1px",
    stroke: "$neutral-color-10",
    transition: "stroke 250ms, fill 250ms, fill-opacity 250ms",
  },
  ".highcharts-treemap-series .highcharts-point-hover": {
    stroke: "$neutral-color-40",
    transition: "stroke 25ms, fill 25ms, fill-opacity 25ms",
  },
  ".highcharts-treemap-series .highcharts-above-level": { display: "none" },
  ".highcharts-treemap-series .highcharts-internal-node": { fill: "none" },
  ".highcharts-treemap-series .highcharts-internal-node-interactive": {
    fillOpacity: 0.15,
    cursor: "pointer",
  },
  ".highcharts-treemap-series .highcharts-internal-node-interactive:hover": {
    fillOpacity: 0.75,
  },
  ".highcharts-legend-box": { fill: "none", strokeWidth: 0 },
  ".highcharts-legend-item text": {
    // fill: "$neutral-color-80",
    fontWeight: "bold",
    // fontSize: "$legend-font-size",
    cursor: "pointer",
    strokeWidth: 0,
  },
  ".highcharts-legend-item:hover text": { fill: "$neutral-color-100" },
  ".highcharts-legend-item-hidden *": {
    fill: "'$neutral-color-20' !important",
    stroke: "'$neutral-color-20' !important",
    transition: "fill 250ms",
  },
  ".highcharts-legend-nav-active": {
    fill: "$highlight-color-100",
    cursor: "pointer",
  },
  ".highcharts-legend-nav-inactive": { fill: "$neutral-color-20" },
  ".highcharts-legend-title-box": { fill: "none", strokeWidth: 0 },
  ".highcharts-loading": {
    position: "absolute",
    // backgroundColor: "$background-color",
    opacity: 0.5,
    textAlign: "center",
    zIndex: 10,
    transition: "opacity 250ms",
  },
  ".highcharts-loading-hidden": {
    height: "0 !important",
    opacity: 0,
    overflow: "hidden",
    transition: "opacity 250ms, height 250ms step-end",
  },
  ".highcharts-loading-inner": {
    fontWeight: "bold",
    position: "relative",
    top: "45%",
  },
  ".highcharts-plot-band, .highcharts-pane": {
    fill: "$neutral-color-100",
    fillOpacity: 0.05,
  },
  ".highcharts-plot-line": {
    fill: "none",
    stroke: "$neutral-color-40",
    strokeWidth: "1px",
  },
  ".highcharts-boxplot-box": { fill: "$background-color" },
  ".highcharts-boxplot-median": { strokeWidth: "2px" },
  ".highcharts-bubble-series .highcharts-point": { fillOpacity: 0.5 },
  ".highcharts-errorbar-series .highcharts-point": {
    stroke: "$neutral-color-100",
  },
  ".highcharts-gauge-series .highcharts-data-label-box": {
    stroke: "$neutral-color-20",
    strokeWidth: "1px",
  },
  ".highcharts-gauge-series .highcharts-dial": {
    fill: "$neutral-color-100",
    strokeWidth: 0,
  },
  ".highcharts-polygon-series .highcharts-graph": {
    fill: "inherit",
    strokeWidth: 0,
  },
  ".highcharts-waterfall-series .highcharts-graph": {
    stroke: "$neutral-color-80",
    strokeDasharray: "1, 3",
  },
  ".highcharts-sankey-series .highcharts-point": { strokeWidth: 0 },
  ".highcharts-sankey-series .highcharts-link": {
    transition: "fill 250ms, fill-opacity 250ms",
    fillOpacity: 0.5,
  },
  ".highcharts-sankey-series .highcharts-point-hover.highcharts-link": {
    transition: "fill 50ms, fill-opacity 50ms",
    fillOpacity: 1,
  },
  ".highcharts-navigator-mask-outside": { fillOpacity: 0 },
  ".highcharts-navigator-mask-inside": {
    fill: "$highlight-color-60",
    fillOpacity: 0.25,
    cursor: "ew-resize",
  },
  ".highcharts-navigator-outline": {
    stroke: "$neutral-color-20",
    fill: "none",
  },
  ".highcharts-navigator-handle": {
    stroke: "$neutral-color-20",
    fill: "$neutral-color-5",
    cursor: "ew-resize",
  },
  ".highcharts-navigator-series": {
    fill: "$navigator-series-fill",
    stroke: "$navigator-series-border",
  },
  ".highcharts-navigator-series .highcharts-graph": { strokeWidth: "1px" },
  ".highcharts-navigator-series .highcharts-area": { fillOpacity: 0.05 },
  ".highcharts-navigator-xaxis .highcharts-axis-line": { strokeWidth: 0 },
  ".highcharts-navigator-xaxis .highcharts-grid-line": {
    strokeWidth: "1px",
    stroke: "$neutral-color-10",
  },
  ".highcharts-navigator-xaxis.highcharts-axis-labels": {
    fill: "currentColor",
  },
  ".highcharts-navigator-yaxis .highcharts-grid-line": { strokeWidth: 0 },
  ".highcharts-scrollbar-thumb": {
    fill: "$neutral-color-20",
    stroke: "$neutral-color-20",
    strokeWidth: "1px",
  },
  ".highcharts-scrollbar-button": {
    fill: "$neutral-color-10",
    stroke: "$neutral-color-20",
    strokeWidth: "1px",
  },
  ".highcharts-scrollbar-arrow": { fill: "$neutral-color-60" },
  ".highcharts-scrollbar-rifles": {
    stroke: "$neutral-color-60",
    strokeWidth: "1px",
  },
  ".highcharts-scrollbar-track": {
    fill: "$scrollbar-track-background",
    stroke: "$scrollbar-track-border",
    strokeWidth: "1px",
  },
  ".highcharts-button": {
    fill: "$highcharts-button-background",
    stroke: "$highcharts-button-border",
    cursor: "default",
    strokeWidth: "1px",
    transition: "fill 250ms",
  },
  ".highcharts-button text": { fill: "$highcharts-button-text" },
  ".highcharts-button-hover": {
    transition: "fill 0ms",
    fill: "$highcharts-button-hover-background",
    stroke: "$highcharts-button-hover-border",
  },
  ".highcharts-button-hover text": { fill: "$highcharts-button-hover-text" },
  ".highcharts-button-pressed": {
    fontWeight: "bold",
    fill: "$highcharts-button-pressed-background",
    stroke: "$highcharts-button-pressed-border",
  },
  ".highcharts-button-pressed text": {
    fill: "$highcharts-button-pressed-text",
    fontWeight: "bold",
  },
  ".highcharts-button-disabled text": { fill: "$highcharts-button-text" },
  ".highcharts-range-selector-buttons .highcharts-button": {
    strokeWidth: "$range-selector-button-border",
  },
  ".highcharts-range-label rect": { fill: "none" },
  ".highcharts-range-label text": { fill: "$neutral-color-60" },
  ".highcharts-range-input rect": { fill: "none" },
  ".highcharts-range-input text": { fill: "$range-selector-input-text" },
  ".highcharts-range-input": {
    strokeWidth: "1px",
    stroke: "$range-selector-input-border",
  },
  "input.highcharts-range-selector": {
    position: "absolute",
    border: "0",
    width: "1px",
    height: "1px",
    padding: "0",
    textAlign: "center",
    left: "-9em",
  },
  ".highcharts-crosshair-label text": {
    fill: "$background-color",
    fontSize: "1.1em",
  },
  ".highcharts-crosshair-label .highcharts-label-box": { fill: "inherit" },
  ".highcharts-candlestick-series .highcharts-point": {
    stroke: "$neutral-color-100",
    strokeWidth: "1px",
  },
  ".highcharts-candlestick-series .highcharts-point-up": {
    fill: "$background-color",
  },
  ".highcharts-ohlc-series .highcharts-point-hover": { strokeWidth: "3px" },
  ".highcharts-flags-series .highcharts-point .highcharts-label-box": {
    stroke: "$neutral-color-40",
    fill: "$background-color",
    transition: "fill 250ms",
  },
  ".highcharts-flags-series .highcharts-point-hover .highcharts-label-box": {
    stroke: "$neutral-color-100",
    fill: "$highlight-color-20",
  },
  ".highcharts-flags-series .highcharts-point text": {
    fill: "$neutral-color-100",
    fontSize: "0.9em",
    fontWeight: "bold",
  },
  ".highcharts-map-series .highcharts-point": {
    transition: "fill 500ms, fill-opacity 500ms, stroke-width 250ms",
    stroke: "$neutral-color-20",
  },
  ".highcharts-map-series .highcharts-point-hover": {
    transition: "fill 0ms, fill-opacity 0ms",
    fillOpacity: 0.5,
    strokeWidth: "2px",
  },
  ".highcharts-mapline-series .highcharts-point": { fill: "none" },
  ".highcharts-heatmap-series .highcharts-point": { strokeWidth: 0 },
  ".highcharts-map-navigation": {
    fontSize: "1.3em",
    fontWeight: "bold",
    textAlign: "center",
  },
  ".highcharts-coloraxis": { strokeWidth: 0 },
  ".highcharts-coloraxis-marker": { fill: "$neutral-color-40" },
  ".highcharts-null-point": { fill: "$neutral-color-3" },
  ".highcharts-3d-frame": { fill: "transparent" },
  ".highcharts-contextbutton": {
    fill: "$context-button-background",
    stroke: "none",
    strokeLinecap: "round",
  },
  ".highcharts-contextbutton:hover": {
    fill: "$neutral-color-10",
    stroke: "$neutral-color-10",
  },
  ".highcharts-button-symbol": {
    stroke: "$neutral-color-60",
    strokeWidth: "3px",
  },
  ".highcharts-menu": {
    border: "1px solid '$neutral-color-40'",
    background: "$background-color",
    padding: "5px 0",
    boxShadow: "3px 3px 10px #888",
  },
  ".highcharts-menu-item": {
    padding: "0.5em 1em",
    background: "none",
    color: "$neutral-color-80",
    cursor: "pointer",
    transition: "background 250ms, color 250ms",
  },
  ".highcharts-menu-item:hover": {
    background: "$highlight-color-80",
    color: "$background-color",
  },
  ".highcharts-drilldown-point": { cursor: "pointer" },
  ".highcharts-drilldown-data-label text,\ntext.highcharts-drilldown-data-label,\n.highcharts-drilldown-axis-label":
    {
      cursor: "pointer",
      fill: "$highlight-color-100",
      fontWeight: "bold",
      textDecoration: "underline",
    },
  ".highcharts-no-data text": {
    fontWeight: "bold",
    fontSize: "12px",
    fill: "$neutral-color-60",
  },
  ".highcharts-axis-resizer": {
    cursor: "ns-resize",
    stroke: "black",
    strokeWidth: "2px",
  },
  ".highcharts-bullet-target": { strokeWidth: 0 },
  ".highcharts-lineargauge-target": {
    strokeWidth: "1px",
    stroke: "$neutral-color-80",
  },
  ".highcharts-lineargauge-target-line": {
    strokeWidth: "1px",
    stroke: "$neutral-color-80",
  },
  ".highcharts-annotation-label-box": {
    strokeWidth: "1px",
    stroke: "$neutral-color-100",
    fill: "$neutral-color-100",
    fillOpacity: 0.75,
  },
  ".highcharts-annotation-label text": { fill: "''$neutral-color-10''" },
  ".highcharts-treegrid-node-collapsed, .highcharts-treegrid-node-expanded": {
    cursor: "pointer",
  },
  ".highcharts-point-connecting-path": { fill: "none" },
  ".highcharts-grid-axis .highcharts-tick": { strokeWidth: "1px" },
  ".highcharts-grid-axis .highcharts-axis-line": { strokeWidth: "1px" },
};
