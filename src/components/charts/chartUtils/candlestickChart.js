import * as d3 from "d3";

export const renderCandlestickChart = (
  svg,
  data,
  width,
  height,
  xScale,
  tooltip,
  theme
) => {
  // Y scale
  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.low) * 0.99,
      d3.max(data, (d) => d.high) * 1.01,
    ])
    .range([height, 0]);

  // Add Y axis
  svg
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

  // Calculate candlestick width based on data density
  const candleWidth = Math.max(4, Math.min(15, width / data.length / 2));

  // Create candlestick group
  const candlesticks = svg
    .selectAll(".candlestick")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "candlestick");

  // Add wicks (high-low lines)
  candlesticks
    .append("line")
    .attr("class", "wick")
    .attr("x1", (d) => xScale(d.date))
    .attr("x2", (d) => xScale(d.date))
    .attr("y1", (d) => yScale(d.high))
    .attr("y2", (d) => yScale(d.low))
    .attr("stroke", theme.chart.candle.wick)
    .attr("stroke-width", 1)
    .style("opacity", 0)
    .transition()
    .delay((d, i) => i * 10)
    .duration(300)
    .style("opacity", 1);

  // Add candle bodies
  candlesticks
    .append("rect")
    .attr("class", "candle")
    .attr("x", (d) => xScale(d.date) - candleWidth / 2)
    .attr("y", (d) => yScale(Math.max(d.open, d.close)))
    .attr("width", candleWidth)
    .attr("height", (d) => {
      const height = Math.abs(yScale(d.open) - yScale(d.close));
      return height < 1 ? 1 : height; // Ensure minimum height
    })
    .attr("fill", (d) =>
      d.close >= d.open ? theme.chart.candle.up : theme.chart.candle.down
    )
    .style("opacity", 0)
    .on("mouseover", function (event, d) {
      // Highlight candle
      d3.select(this)
        .transition()
        .duration(100)
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      // Show tooltip
      tooltip
        .style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px").html(`
            <strong>Date:</strong> ${d.date.toLocaleDateString()}<br>
            <strong>Open:</strong> $${d.open.toFixed(2)}<br>
            <strong>High:</strong> $${d.high.toFixed(2)}<br>
            <strong>Low:</strong> $${d.low.toFixed(2)}<br>
            <strong>Close:</strong> $${d.close.toFixed(2)}<br>
            <strong>Volume:</strong> ${d.volume.toLocaleString()}<br>
            <strong>Change:</strong> ${(
              ((d.close - d.open) / d.open) *
              100
            ).toFixed(2)}%
          `);
    })
    .on("mouseout", function () {
      // Remove highlight
      d3.select(this).transition().duration(100).attr("stroke", "none");

      // Hide tooltip
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .transition()
    .delay((d, i) => i * 10)
    .duration(300)
    .style("opacity", 1);

  // Add a legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 100}, 0)`);

  // Up candle
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", theme.chart.candle.up);

  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text("Price Up")
    .style("font-size", "12px")
    .style("fill", theme.text);

  // Down candle
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", theme.chart.candle.down);

  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 37)
    .text("Price Down")
    .style("font-size", "12px")
    .style("fill", theme.text);
};
