import {LEGEND_MARK_SIZE, LEGEND_GAP, LEGEND_VISIBLE_LIMIT, LEGEND_WIDTH, LEGEND_PADDING, LEGEND_LABEL_LEN_LIMIT, LEGEND_QUAN_MARK_HEIGHT} from "./default-design";
import {_rect, _x, _y, _width, _height, _fill, _stroke, _text, _text_anchor, _start, _alignment_baseline, _middle, _font_size, _font_weight, _bold, _transform, _g, _id, _offset, _stop_color, _x1, _y1, _x2, _y2, _color, _end, GSelection} from "src/useful-factory/d3-str";
import d3 = require("d3");
import {translate, shortenText} from "src/useful-factory/utils";
import {isNullOrUndefined} from "util";

export function renderLegend(
  g: GSelection,
  title: string,
  domain: string[] | number[],
  range: string[],
  isQuantitative?: boolean) {

  const left = LEGEND_PADDING, right = LEGEND_PADDING
  // title
  g.append('text')
    .classed('legend-title', true)
    .attr(_x, left)
    .attr(_y, -7)
    .style(_font_size, '10px')
    .style(_text_anchor, 'start')
    .style(_font_weight, 'bold')
    .text(shortenText(title, LEGEND_LABEL_LEN_LIMIT))
    // interactions
    .on("mouseover", (d, _i, n) => d3.select(n[_i]).text(title))
    .on("mouseout", (d, _i, n) => d3.select(n[_i]).text(shortenText(title, LEGEND_LABEL_LEN_LIMIT)))

  if (!isQuantitative) {
    // Notice: domain.length is always equal or larger than range.length
    for (let i = 0; i < domain.length; i++) {
      if (isNullOrUndefined(domain[i])) continue // TODO: what is the problem continuously getting undefined or null??

      g.append(_rect)
        .attr(_x, left)
        .attr(_y, i * (LEGEND_MARK_SIZE.height + LEGEND_GAP))
        .attr(_width, LEGEND_MARK_SIZE.width)
        .attr(_height, LEGEND_MARK_SIZE.height)
        .attr(_fill, range[i >= range.length ? i - range.length : i])  // handle corner case
        .attr(_stroke, "null")

      g.append(_text)
        .attr(_x, left + LEGEND_MARK_SIZE.width + LEGEND_GAP)
        .attr(_y, i * (LEGEND_MARK_SIZE.height + LEGEND_GAP) + LEGEND_MARK_SIZE.height / 2.0)
        .attr(_text_anchor, _start)
        .attr(_alignment_baseline, _middle)
        .attr(_fill, "black")
        .attr(_font_size, "10px")
        .text(shortenText(domain[i].toString(), LEGEND_LABEL_LEN_LIMIT))
        // interactions
        .on("mouseover", (d, _i, n) => d3.select(n[_i]).text(domain[i].toString()))
        .on("mouseout", (d, _i, n) => d3.select(n[_i]).text(shortenText(domain[i].toString(), LEGEND_LABEL_LEN_LIMIT)))

      // omit rest of us when two many of them
      if (i == LEGEND_VISIBLE_LIMIT) {
        g.append(_text)
          .attr(_x, left + LEGEND_MARK_SIZE.width + LEGEND_GAP)
          .attr(_y, (i + 1) * (LEGEND_MARK_SIZE.height + LEGEND_GAP) + LEGEND_MARK_SIZE.height / 2.0)
          .attr(_text_anchor, _start)
          .attr(_alignment_baseline, _middle)
          .attr(_fill, "black")
          .attr(_font_weight, _bold)
          .attr(_font_size, "18px")
          .text("...")
        break
      }
    }
  }
  else {
    const legendWidth = LEGEND_WIDTH - left - right
    const defs = g.append("defs")
    const key = "linear-gradient" + range.toString()
    const linearGradient = defs.append("linearGradient")
      .attr(_id, key)
      .attr(_x1, '0%')
      .attr(_y1, '100%')
      .attr(_x2, '100%')
      .attr(_y2, '100%')

    let scale = d3.scaleLinear<string>().range(range).domain(d3.extent(domain as number[]))
    linearGradient.selectAll("stop")
      .data([
        {offset: `${100 * 0 / 2}%`, color: scale(d3.extent(domain as number[])[0])},
        {offset: `${100 * 2 / 2}%`, color: scale(d3.extent(domain as number[])[1])}
      ])
      .enter().append("stop")
      .attr(_offset, d => d[_offset])
      .attr(_stop_color, d => d[_color])

    g.append(_g)
      .append(_rect)
      .attr(_x, left)
      .attr(_width, legendWidth)
      .attr(_height, LEGEND_QUAN_MARK_HEIGHT)
      .style(_fill, `url(#${key})`)

    const q = d3.scaleLinear()
      .domain(d3.extent(domain as number[])).nice()
      .rangeRound([0, legendWidth])

    let yAxis = d3.axisBottom(q).ticks(3).tickSizeOuter(0)
    g.append(_g)
      .classed("axis", true)
      .attr(_transform, translate(left, 15))
      .attr('dy', '.71em')
      .call(yAxis)
      .selectAll('.axis text')
      .attr(_font_size, 8 + "px")
      // .attr(_x, -8)
      // .attr(_y, 0)
      // .attr(_transform, rotate(310))
      // .attr(_text_anchor, _end)
      .text(d => d3.format(".2s")(Number(d)))
  }
}