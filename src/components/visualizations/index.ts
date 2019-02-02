import {Spec} from "src/models/simple-vega-spec";
import {renderSimpleBarChart, renderBarChart} from "./barcharts";
import {ChartTypes} from "src/models/chart-types";
import {renderSimpleScatterplot, renderScatterplot} from "./scatterplots";
import {ChartStyle} from "./chart-styles";
import {CompSpec, DEFAULT_COMP_SPEC} from "src/models/comp-spec";
import {DATASET_MOVIES} from "src/datasets/movies";
import {_opacity} from "./design-settings";
import {isUndefined} from "util";

// test
export function getExampleSpecs(): {A: Spec, B: Spec, C: CompSpec} {
  return {
    // https://vega.github.io/vega-lite/examples/
    A: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "point",
      encoding: {
        x: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
        y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
        color: {field: "MPAA_Rating", type: "nominal"}
      }
    },
    B: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "bar",
      encoding: {
        x: {field: "MPAA_Rating", type: "nominal"},
        y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
        color: {field: "MPAA_Rating", type: "nominal"}
      }
    },
    C: {
      ...DEFAULT_COMP_SPEC,
      layout: "juxtaposition",
      // direction: "vertical",
      unit: "chart",
      // mirrored: false,
      consistency: {
        x_axis: false, y_axis: false, color: false
      }
    }
  }
}

export function renderSimpleChart(ref: SVGSVGElement, spec: Spec) {
  switch (getChartType(spec)) {
    case "scatterplot":
      renderSimpleScatterplot(ref, spec)
      break;
    case "barchart":
      renderSimpleBarChart(ref, spec)
      break;
    case "linechart":
      //
      break;
    default:
      break;
  }
}

// TODO: this should be combined with renderSimpleChart
export function renderChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[] | number[], y: string[] | number[]}, // determine the axis range
  s: ChartStyle) {
  switch (getChartType(spec)) {
    case "scatterplot":
      renderScatterplot(g, spec, domain, s)
      break;
    case "barchart":
      renderBarChart(g, spec, domain, s)
      break;
    case "linechart":
      //
      break;
    default:
      break;
  }
}

export function canRenderChart(spec: Spec) {
  let can = true;

  // exceptions
  if (isScatterplot(spec) &&
    (isUndefined(spec.encoding.x.aggregate) && !isUndefined(spec.encoding.y.aggregate) ||
      !isUndefined(spec.encoding.x.aggregate) && isUndefined(spec.encoding.y.aggregate) ||
      (!isUndefined(spec.encoding.x.aggregate) && !isUndefined(spec.encoding.y.aggregate) && isUndefined(spec.encoding.color)))) {
    // in scatterplot, x- and y-aggregation functions should be always used together, and when both of them are used, color should be used
    can = false
  }

  return can
}

export function canRenderCompChart(A: Spec, B: Spec, C: CompSpec) {
  let can = true;

  // exceptions
  if ((isScatterplot(A) || isScatterplot(B)) && C.layout === "juxtaposition" && C.unit === "element") can = false
  if (isScatterplot(A) && C.layout === "superimposition" && C.unit === "element") can = false

  if (!can) console.log("error: such comparison is not supported.")
  return can
}

export function getChartType(spec: Spec): ChartTypes {
  if (isScatterplot(spec)) return "scatterplot"
  else if (isBarChart(spec)) return "barchart"
  else if (isLineChart(spec)) return "linechart"
  else return "scatterplot"
}
export function isBarChart(spec: Spec) {
  return spec.mark === "bar" &&
    spec.encoding.x.type === 'nominal' && spec.encoding.y.type === 'quantitative';
}
export function isScatterplot(spec: Spec) {
  return spec.mark === "point" &&
    spec.encoding.x.type === 'quantitative' && spec.encoding.y.type === 'quantitative';
}
export function isLineChart(spec: Spec) {
  return spec.mark === "line" &&
    spec.encoding.x.type === 'nominal' && spec.encoding.y.type === 'quantitative';  // TODO: should add ordinal?
}