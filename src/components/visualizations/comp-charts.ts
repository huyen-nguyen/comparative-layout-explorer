import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, _CompSpecSolid} from "src/models/comp-spec";
import {translate, uniqueValues} from "src/useful-factory/utils";
import {AXIS_ROOT_ID, Coordinate} from "./default-design-manager";
import {renderLegend} from "./legends";
import {renderChart} from ".";
import {oneOfFilter, getFieldsByType} from "./data-handler";
import {getStyles} from "./chart-styles/style-manager";
import {getLayouts} from "./chart-styles/layout-manager";
import {getDomain} from "./data-handler/domain-manager";
import {correctCompSpec} from "src/models/comp-spec-manager";
import {_transform, _width, _height, _g, _opacity} from "src/useful-factory/d3-str";
import {canRenderChart, canRenderCompChart} from "./constraints";
import {animateChart} from "./animated";
import {getLegends} from "./legends/legend-manager";
import {DF_DELAY, DF_DURATION} from "./animated/default-design";
import {isScatterplot, isChartAnimated, getChartType} from "src/models/chart-types";
import {renderLineConnection} from "./line-connection";
import {getChartData} from "./data-handler/chart-data-manager";
import {preprocessData} from "./data-handler/data-preprocessor";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  /* data manipulate (e.g., add id column) */
  const {_A: _dA, _B: _dB} = preprocessData({...A}, {...B});

  /* correct minor issues in CompSpec and make CompSpec as _CompSpecSolid */
  const {_A, _B, solidC} = correctCompSpec({..._dA}, {..._dB}, {...C});

  /* check whether specified charts are supported */
  if (!canRenderChart(_A) || !canRenderChart(_B) || !canRenderCompChart(_A, _B, solidC)) return;

  /* render Comp Chart */
  renderCompChartGeneralized(ref, _A, _B, solidC);
}

export function renderCompChartGeneralized(ref: SVGSVGElement, A: Spec, B: Spec, C: _CompSpecSolid) {
  // all {}.B are set to undefined if layout === explicit encoding
  const {...chartdata} = getChartData(A, B, C);
  const {...domains} = getDomain(A, B, C, chartdata);
  const {...styles} = getStyles(A, B, C, chartdata, domains);
  const {...layouts} = getLayouts(A, B, C, domains, styles); // set translateX, translateY, and chartLayout
  const {...legends} = getLegends(A, B, C, {A: layouts.A, B: layouts.B}, styles);

  let coordinateA: Coordinate[] | void, coordinateB: Coordinate[] | void;

  d3.select(ref).selectAll('*').remove();
  const svg = d3.select(ref).attr(_width, layouts.width + legends.addWidth).attr(_height, d3.max([legends.height, layouts.height]));
  d3.select(ref).attr("viewBox", `0 0 ${layouts.width + legends.addWidth} ${d3.max([legends.height, layouts.height])}`);

  // render A and (not nested) B
  function loopABRender() {
    svg.selectAll(".A,.B").remove();
    /* render A */
    if (!Array.isArray(domains.A.axis)) {
      coordinateA = renderChart(svg, A, {x: domains.A.axis.x, y: domains.A.axis.y}, styles.A.color, styles.A);
    }
    /* render B */
    if (domains.B && !Array.isArray(domains.B.axis)) {
      coordinateB = renderChart(svg, B, {x: domains.B.axis.x, y: domains.B.axis.y}, styles.B.color, styles.B);
    }
  }

  loopABRender();

  // show element-wise animated transitions
  if (styles.B && styles.B.elementAnimated) d3.interval(function () {loopABRender();}, DF_DELAY + DF_DURATION + DF_DELAY);

  /* 1D nesting: B is separated to multiple charts by A */
  if (domains.B && styles.B && Array.isArray(domains.B.axis) && styles.B.nestDim === 1) {
    const n = isScatterplot(A) ? "color" : A.encoding.x.type === "nominal" ? "x" : "y";
    for (let i = 0; i < layouts.nestedBs.length; i++) {
      let filteredData = oneOfFilter(B.data.values, A.encoding[n].field, domains.A.axis[n][i] as string);
      let filteredSpec = {...B, data: {...B.data, values: filteredData}};
      styles.B.altVals = getChartData(filteredSpec, undefined, undefined, [domains.B.axis[i]["x"], domains.B.axis[i]["y"]]).A;
      // TODO: width and height is not included in styles => any ways to make this clearer?
      renderChart(svg, filteredSpec, {x: domains.B.axis[i]["x"], y: domains.B.axis[i]["y"]}, styles.B.color, {
        ...styles.B,
        width: layouts.nestedBs[i]["width"],
        height: layouts.nestedBs[i]["height"],
        translateX: layouts.nestedBs[i]["left"] + layouts.B.left,
        translateY: layouts.nestedBs[i]["top"] + layouts.B.top
      });
    }
  }
  /* 2D nesting: for heatmap A */
  else if (domains.B && styles.B && Array.isArray(domains.B.axis) && styles.B.nestDim === 2) {
    const ns = getFieldsByType(A, "nominal");
    for (let i = 0; i < uniqueValues(A.data.values, ns[0].field).length; i++) {
      for (let j = 0; j < uniqueValues(A.data.values, ns[1].field).length; j++) {
        let filteredData = oneOfFilter(
          oneOfFilter(B.data.values, A.encoding[ns[0].channel].field, domains.A.axis[ns[0].channel][i] as string),
          A.encoding[ns[1].channel].field,
          domains.A.axis[ns[1].channel][j] as string);
        let filteredSpec = {...B, data: {...B.data, values: filteredData}};
        styles.B.altVals = getChartData(filteredSpec, undefined, undefined, [domains.B.axis[i][j]["x"], domains.B.axis[i][j]["y"]]).A;
        renderChart(svg, filteredSpec, {x: domains.B.axis[i][j]["x"], y: domains.B.axis[i][j]["y"]}, styles.B.color, {
          ...styles.B,
          width: layouts.nestedBs[i][j].width,
          height: layouts.nestedBs[i][j].height,
          translateX: layouts.nestedBs[i][j].left + layouts.B.left,
          translateY: layouts.nestedBs[i][j].top + layouts.B.top
        });
      }
    }
  }

  /* explicit encoding overlay */
  if (C && C.explicit_encoding) {
    if (C.explicit_encoding.line_connection && C.explicit_encoding.line_connection.type) {
      renderLineConnection(svg, coordinateA as Coordinate[], coordinateB as Coordinate[]);
    }
    if (C.explicit_encoding.difference_mark) {
      // TODO: now only works for vertical bar charts
      if (getChartType(A) === getChartType(B) && getChartType(A) === "barchart") {

        const newC = {...C, layout: {type: "explicit-encoding"}} as _CompSpecSolid;

        // change color of tick marks
        const newColor = d3.scaleOrdinal()
          // no domain
          .domain(["NULL"])
          .range(["#D60000"]);

        const {...chartdata} = getChartData(A, B, newC);
        const {...domains} = getDomain(A, B, newC, chartdata);
        const {...styles} = getStyles(A, B, newC, chartdata, domains);
        let newStyle = {...styles, A: {...styles.A, noAxes: true, noGrid: true, color: newColor}};
        getLayouts(A, B, newC, domains, newStyle); // set translateX, translateY, and chartLayout
        newStyle = {...styles, A: {...newStyle.A, translateX: newStyle.A.translateX + 4}};

        /// Debug
        // console.log(newStyle);
        // console.log(domains);
        //

        if (!Array.isArray(domains.A.axis)) {
          renderChart(svg, A, {x: domains.A.axis.x, y: domains.A.axis.y}, newStyle.A.color, newStyle.A);
        }
      }
    }
  }

  /* legends */
  legends.recipe.forEach(legend => {
    const legendG = svg.append(_g).attr(_transform, translate(legend.left, legend.top));
    renderLegend(legendG, legend.title, legend.scale.domain() as string[], legend.scale.range() as string[], !legend.isNominal, legend.styles);
  });

  /* apply visual properties after rendering charts */
  // z-index
  if (styles.A.onTop) svg.selectAll(".A").raise();
  if (styles.B && styles.B.onTop) svg.selectAll(".B").raise();
  svg.selectAll("." + AXIS_ROOT_ID).lower();
  // animated
  if (C && isChartAnimated(C)) {
    animateChart(svg.selectAll(".A"), svg.selectAll(".B"));
  }
}