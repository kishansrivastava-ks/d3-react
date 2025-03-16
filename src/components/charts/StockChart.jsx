import styled from "styled-components";
import { renderPieChart } from "./chartUtils/pieChart";
import { renderLineChart } from "./chartUtils/lineChart";
import { renderBarChart } from "./chartUtils/barChart";
import { renderCandlestickChart } from "./chartUtils/candlestickChart";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const CHART_TYPES = {
  LINE: "line",
  CANDLESTICK: "candlestick",
  BAR: "bar",
  PIE: "pie",
};

export const StockChart = ({ data, chartType, theme }) => {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Chart dimensions and margins
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3
      .select(chartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip div if it doesn't exist
    const tooltip = d3
      .select(tooltipRef.current)
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", theme.secondary)
      .style("border", `1px solid ${theme.chart.axes}`)
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", theme.text)
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("z-index", 100);

    // Parse dates
    const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
    const formattedData = data.map((d) => ({
      ...d,
      date: parseDate(d.timestamp) || new Date(d.timestamp),
    }));

    // Sort data by date
    formattedData.sort((a, b) => a.date - b.date);

    // X scale
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(formattedData, (d) => d.date))
      .range([0, width]);

    // Create X axis
    const xAxis = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat(d3.timeFormat("%b %d"))
          .ticks(width > 500 ? 10 : 5)
      );

    // X axis label
    svg
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Date")
      .style("fill", theme.text);

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid x-grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""))
      .selectAll("line")
      .style("stroke", theme.chart.grid)
      .style("stroke-opacity", 0.2);

    // Render the appropriate chart based on type
    switch (chartType) {
      case CHART_TYPES.LINE:
        renderLineChart(
          svg,
          formattedData,
          width,
          height,
          xScale,
          tooltip,
          theme
        );
        break;
      case CHART_TYPES.CANDLESTICK:
        renderCandlestickChart(
          svg,
          formattedData,
          width,
          height,
          xScale,
          tooltip,
          theme
        );
        break;
      case CHART_TYPES.BAR:
        renderBarChart(
          svg,
          formattedData,
          width,
          height,
          xScale,
          tooltip,
          theme
        );
        break;
      case CHART_TYPES.PIE:
        renderPieChart(svg, formattedData, width, height, tooltip, theme);
        break;
      default:
        renderLineChart(
          svg,
          formattedData,
          width,
          height,
          xScale,
          tooltip,
          theme
        );
    }

    // Add chart title
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .text(
        `${data[0].symbol || "Stock"} ${
          chartType.charAt(0).toUpperCase() + chartType.slice(1)
        } Chart`
      )
      .style("fill", theme.text)
      .style("font-size", "20px")
      .style("font-weight", "bold");

    // Create functions for zooming and panning
    if (chartType !== CHART_TYPES.PIE) {
      // Define zoom behavior
      const zoom = d3
        .zoom()
        .scaleExtent([0.5, 5])
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", (event) => {
          // Update scales according to zoom
          const newXScale = event.transform.rescaleX(xScale);

          // Update axes with new scales
          xAxis.call(
            d3.axisBottom(newXScale).tickFormat(d3.timeFormat("%b %d"))
          );

          // Update chart elements based on chart type
          if (chartType === CHART_TYPES.LINE) {
            svg.selectAll(".line").attr(
              "d",
              d3
                .line()
                .x((d) => newXScale(d.date))
                .y((d) => d.yScale(d.close))
            );

            svg.selectAll(".dot").attr("cx", (d) => newXScale(d.date));
          } else if (chartType === CHART_TYPES.CANDLESTICK) {
            svg.selectAll(".candle").attr("x", (d) => newXScale(d.date) - 5);

            svg
              .selectAll(".wick")
              .attr("x1", (d) => newXScale(d.date))
              .attr("x2", (d) => newXScale(d.date));
          } else if (chartType === CHART_TYPES.BAR) {
            const barWidth = Math.max(
              2,
              Math.min(10, width / formattedData.length / 2)
            );

            svg
              .selectAll(".bar")
              .attr("x", (d) => newXScale(d.date) - barWidth / 2)
              .attr("width", barWidth);
          }
        });

      // Add zoom behavior to SVG
      svg.call(zoom);

      // Add zoom instructions
      svg
        .append("text")
        .attr("class", "zoom-instructions")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", -10)
        .text("Use mouse wheel to zoom, drag to pan")
        .style("fill", theme.text)
        .style("font-size", "12px")
        .style("opacity", 0.7);
    }
  }, [data, chartType, theme]);

  return (
    <ChartContainer>
      <svg ref={chartRef}></svg>
      <div ref={tooltipRef} className="tooltip"></div>
    </ChartContainer>
  );
};

const ChartContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;

  .tooltip {
    position: absolute;
    pointer-events: none;
    background: ${(props) => props.theme.secondary};
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }

  svg {
    overflow: visible;

    .x-axis path,
    .y-axis path {
      stroke: ${(props) => props.theme.chart.axes};
    }

    .x-axis text,
    .y-axis text {
      fill: ${(props) => props.theme.text};
      font-size: 12px;
    }

    .grid line {
      stroke: ${(props) => props.theme.chart.grid};
      stroke-opacity: 0.2;
    }
  }
`;
