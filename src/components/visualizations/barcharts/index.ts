import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {translate, ifUndefinedGetDefault, uniqueValues} from 'src/useful-factory/utils';
import {CHART_MARGIN, CHART_SIZE, getBarWidth, getBarColor, getChartSize, _width, _height, _g, _transform, _rect, _y, _x, _fill, _stroke, _stroke_width} from '../design-settings';
import {isUndefined} from 'util';
import {BarchartStyle} from 'src/models/barchart-style';
import {renderLegend} from '../legends';
import {renderAxes} from '../axes';
import {getAggValues} from '../data-handler';
import {LEGEND_PADDING} from '../legends/default-design';
import {ScaleBand, ScaleLinear} from 'd3';
import {DEFAULT_CHART_STYLE} from '../chart-styles';

export function renderSimpleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {values} = spec.data;
  const {color} = spec.encoding;
  const {field: xField} = spec.encoding.x, {field: yField, aggregate} = spec.encoding.y;

  const aggValsByKey = getAggValues(values, xField, [yField], aggregate);

  d3.select(ref).selectAll('*').remove();

  const chartsp = getChartSize(1, 1, {legend: [0]})
  d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height)

  const g = d3.select(ref).append(_g)
    .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));

  const c = d3.scaleOrdinal()
    .domain(aggValsByKey.map(d => d.key))
    .range(getBarColor(isUndefined(color) ? 1 : aggValsByKey.map(d => d.key).length));

  renderBarChart(g, spec, {x: aggValsByKey.map(d => d.key), y: aggValsByKey.map(d => d.value).map((d: object) => d[yField])}, {...DEFAULT_CHART_STYLE, color: c, colorKey: "key", legend: !isUndefined(color)})
}

// TODO: only vertical bar charts are handled
export function renderBarChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[] | number[], y: string[] | number[]}, // determine the axis range
  styles: BarchartStyle) {

  const {values} = spec.data;
  const {aggregate} = spec.encoding.y;
  const aggValues = ifUndefinedGetDefault(styles.altVals, getAggValues(values, spec.encoding.x.field, [spec.encoding.y.field], aggregate));
  const {x, y} = renderAxes(g, domain.x, domain.y, spec, styles);
  const {...designs} = renderBars(g, aggValues, spec.encoding.y.field/*"value"*/, "key", uniqueValues(domain.x, "").length, x as ScaleBand<string>, y as ScaleLinear<number, number>, {...styles, colorKey: "key"})
  if (styles.legend) renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + CHART_MARGIN.right + LEGEND_PADDING, 0)), styles.color.domain() as string[], styles.color.range() as string[])
  return {designs}
}

export function renderBars(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  vKey: string,
  gKey: string,
  numOfX: number,
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  styles: BarchartStyle) {

  const {mulSize, shiftBy, yOffsetData, xPreStr, barGap, width, height, stroke, stroke_width} = styles
  const bandUnitSize = width / numOfX
  const barWidth = ifUndefinedGetDefault(styles.barWidth, getBarWidth(width, numOfX, barGap) * mulSize) as number;

  g.selectAll('bar')
    .data(data)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_y, d => styles.revY ? 0 : y(d["value"][vKey]) + // TOOD: clean up more?
      (!isUndefined(yOffsetData) && !isUndefined(yOffsetData.filter(_d => _d[gKey] === d[gKey])[0]) ?
        (- height + y(yOffsetData.filter(_d => _d[gKey] === d[gKey])[0]["value"][vKey])) : 0))
    .attr(_x, d => x(xPreStr + d[gKey]) + bandUnitSize / 2.0 - barWidth / 2.0 + barWidth * shiftBy)
    .attr(_width, barWidth)
    .attr(_height, d => (styles.revY ? y(d["value"][vKey]) : height - y(d["value"][vKey])))
    .attr(_fill, d => styles.color(d[styles.colorKey === "" ? vKey : styles.colorKey]) as string)
    .attr(_stroke, stroke)
    .attr(_stroke_width, stroke_width)

  return {barWidth, x, y, bandUnitSize}
}