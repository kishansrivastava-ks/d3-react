import * as d3 from "d3";

export const renderLineChart = (
  svg,
  data,
  width,
  height,
  xScale,
  tooltip,
  theme,
  chartElement
) => {
  // Y scale
  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.low) * 0.99,
      d3.max(data, (d) => d.high) * 1.01,
    ])
    .range([height, 0]);

  // Add Y axis with transition
  // 🔴🔴 CHECK
  // eslint-disable-next-line no-unused-vars
  const yAxis = svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat((d) => `$${d.toFixed(2)}`));

  // Y axis label
  svg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Price ($)")
    .style("fill", theme.text);

  // Add Y grid lines
  svg
    .append("g")
    .attr("class", "grid y-grid")
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
    .selectAll("line")
    .style("stroke", theme.chart.grid)
    .style("stroke-opacity", 0.2);

  // Store y scale with each data point for zoom
  data.forEach((d) => {
    d.yScale = yScale;
  });

  // Create a line generator
  const line = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.close))
    .curve(d3.curveMonotoneX); // Smooth curve

  // Add the path with transition
  const path = svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", theme.chart.line)
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // Add line animation
  const pathLength = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", pathLength)
    .attr("stroke-dashoffset", pathLength)
    .transition()
    .duration(1500)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // Add dots for data points
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d.date))
    .attr("cy", (d) => yScale(d.close))
    .attr("r", 0) // Start with radius 0
    .style("fill", theme.chart.line)
    .style("opacity", 0.7)
    .style("stroke", "white")
    .style("stroke-width", 1)
    .on("mouseover", function (event, d) {
      // Enlarge dot
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 8)
        .style("opacity", 1);

      // 🔴🔴 TEST
      const svgRect = chartElement.getBoundingClientRect();
      // Show tooltip
      tooltip
        .style("opacity", 1)
        // .style("left", event.pageX + 10 + "px")
        // .style("top", event.pageY - 20 + "px")
        .style("left", event.pageX - svgRect.left + 10 + "px")
        .style("top", event.pageY - svgRect.top - 20 + "px").html(`
            <strong>Date:</strong> ${d.date.toLocaleDateString()}<br>
            <strong>Open:</strong> $${d.open.toFixed(2)}<br>
            <strong>High:</strong> $${d.high.toFixed(2)}<br>
            <strong>Low:</strong> $${d.low.toFixed(2)}<br>
            <strong>Close:</strong> $${d.close.toFixed(2)}<br>
            <strong>Volume:</strong> ${d.volume.toLocaleString()}
          `);
    })
    .on("mouseout", function () {
      // Restore dot size
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 4)
        .style("opacity", 0.7);

      // Hide tooltip
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .transition() // Animate dots appearance
    .delay((d, i) => i * 20)
    .duration(500)
    .attr("r", 4);

  // Add area under the line
  svg
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("fill", theme.chart.line)
    .attr("fill-opacity", 0.1)
    .attr(
      "d",
      d3
        .area()
        .x((d) => xScale(d.date))
        .y0(height)
        .y1((d) => yScale(d.close))
        .curve(d3.curveMonotoneX)
    )
    .attr("opacity", 0) // Start invisible
    .transition()
    .duration(1500)
    .attr("opacity", 1); // Fade in
};
