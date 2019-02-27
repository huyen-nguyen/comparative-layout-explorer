import {BAR_GAP, CHART_SIZE, getConstantColor, NESTING_PADDING} from "../default-design-manager";
import {SCATTER_POINT_SIZE} from "../scatterplots/default-design";
import {DEFAULT_HEATMAP_CELL_PADDING, CELL_NULL_COLOR} from "../heatmap/default-design";
import {_lightgray, ScaleOrdinal, ScaleLinearColor, _white, _black} from "src/useful-factory/d3-str";

export type ChartStyle = CommonChartStyle

export interface CommonChartStyle {
  chartId: "A" | "B"
  // globar style
  opacity: number
  // layout
  nestDim: 0 | 1 | 2
  nestingPadding: number
  // chart common
  color: ScaleOrdinal | ScaleLinearColor
  stroke: ScaleOrdinal | ScaleLinearColor
  strokeKey: string
  stroke_width: number
  axisLabelColor: ScaleOrdinal | ScaleLinearColor
  axisLabelColorKey: string
  elementAnimated: boolean
  jitter_x: number
  jitter_y: number
  // colorKey: string // deprecated
  onTop: boolean
  translateX: number
  translateY: number
  // axes common
  noAxes: boolean
  noGrid: boolean
  // x-axis
  xName: string
  noX: boolean
  topX: boolean
  revX: boolean
  // y-axis
  yName: string
  simpleY: boolean
  rightY: boolean
  noYTitle: boolean
  revY: boolean
  noY: boolean
  noYLine: boolean
  // legend
  legendNameColor: string
  //
  xSlant: boolean
  width: number
  height: number
  altVals: object[]
  legend: boolean
  xPreStr: string
  // bar chart
  barGap: number
  barSize: string
  mulSize: number
  mulHeigh: number
  shiftXBy: number
  shiftYBy: number
  verticalBar: boolean
  barOffset: {data: object[], valueField: string, keyField: string}
  barOffsetData: object[] // deprecated
  // scatterplot
  pointSize: number
  rectPoint: boolean
  // heatmap
  cellPadding: number
  nullCellFill: string
}

export const DEFAULT_CHART_STYLE: CommonChartStyle = {
  chartId: "A",
  opacity: 1,
  //layout
  nestDim: 0,
  nestingPadding: NESTING_PADDING,
  //
  color: getConstantColor(),
  stroke: getConstantColor(_white),
  strokeKey: undefined,
  stroke_width: 0,
  jitter_x: 0,
  jitter_y: 0,
  //
  axisLabelColor: getConstantColor(_black),
  axisLabelColorKey: undefined,
  //
  elementAnimated: false,
  onTop: false,
  translateX: 0,
  translateY: 0,

  noAxes: false,
  noX: false,
  noY: false,
  topX: false,
  simpleY: false,
  rightY: false,
  revX: false,
  revY: false,
  noYTitle: false,
  noGrid: false,
  noYLine: true,
  xName: undefined,
  yName: undefined,
  // legend
  legendNameColor: undefined,
  //
  xSlant: true,
  barGap: BAR_GAP,
  width: CHART_SIZE.width,
  height: CHART_SIZE.height,
  altVals: undefined,
  legend: false,
  // below options are relative numbers (e.g., 0.5, 1.0, ...)
  // mulSize is applied first, and then shift bars
  mulSize: 1,
  mulHeigh: 1,
  shiftXBy: 0,
  shiftYBy: 0,
  xPreStr: "",
  barSize: undefined,
  // bar
  verticalBar: true,
  barOffset: undefined,
  barOffsetData: undefined,
  // scatterplot
  pointSize: SCATTER_POINT_SIZE,
  rectPoint: false,
  // heatmap
  cellPadding: DEFAULT_HEATMAP_CELL_PADDING,
  nullCellFill: CELL_NULL_COLOR
}