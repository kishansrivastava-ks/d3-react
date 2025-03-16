import * as d3 from "d3";

export const renderBarChart = (
  svg,
  data,
  width,
  height,
  xScale,
  tooltip,
  theme
) => {
  // Y scale for volume
  const yVolumeScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.volume) * 1.05])
    .range([height, 0]);

  // Add Y axis
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yVolumeScale).tickFormat((d) => d3.format(".2s")(d)));

  // Y axis label
  svg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Volume")
    .style("fill", theme.text);

  // Calculate bar width based on data density
  const barWidth = Math.max(2, Math.min(15, width / data.length / 1.5));

  // Add the bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.date) - barWidth / 2)
    .attr("y", height) // Start from bottom
    .attr("width", barWidth)
    .attr("height", 0) // Start with height 0
    .attr("fill", (d) =>
      d.close >= d.open ? theme.chart.candle.up : theme.chart.candle.down
    )
    .attr("stroke", theme.chart.bar)
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      // Highlight bar
      d3.select(this)
        .transition()
        .duration(100)
        .attr("fill-opacity", 0.8)
        .attr("stroke-width", 2);

      // Show tooltip
      tooltip
        .style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px").html(`
            <strong>Date:</strong> ${d.date.toLocaleDateString()}<br>
            <strong>Volume:</strong> ${d.volume.toLocaleString()}<br>
            <strong>Close:</strong> $${d.close.toFixed(2)}<br>
            <strong>Change:</strong> ${(
              ((d.close - d.open) / d.open) *
              100
            ).toFixed(2)}%
          `);
    })
    .on("mouseout", function () {
      // Remove highlight
      d3.select(this)
        .transition()
        .duration(100)
        .attr("fill-opacity", 1)
        .attr("stroke-width", 1);

      // Hide tooltip
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .transition() // Animate bar growth
    .delay((d, i) => i * 10)
    .duration(500)
    .attr("y", (d) => yVolumeScale(d.volume))
    .attr("height", (d) => height - yVolumeScale(d.volume));

  // Add a reference line for average volume
  const avgVolume = d3.mean(data, (d) => d.volume);

  svg
    .append("line")
    .attr("class", "avg-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", yVolumeScale(avgVolume))
    .attr("y2", yVolumeScale(avgVolume))
    .attr("stroke", theme.text)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0)
    .transition()
    .duration(1000)
    .attr("opacity", 0.7);

  // Add label for average line
  svg
    .append("text")
    .attr("class", "avg-label")
    .attr("x", width - 130)
    .attr("y", yVolumeScale(avgVolume) - 7)
    .text(`Avg Volume: ${d3.format(".2s")(avgVolume)}`)
    .style("fill", theme.text)
    .style("font-size", "11px")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 0.9);

  // Add moving average line (10-day) if enough data points
  if (data.length > 10) {
    // Calculate moving average
    for (let i = 9; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < 10; j++) {
        sum += data[i - j].volume;
      }
      data[i].ma10 = sum / 10;
    }

    // Create line for moving average
    const maLine = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => (d.ma10 ? yVolumeScale(d.ma10) : null))
      .defined((d) => d.ma10 !== undefined);

    // Add the MA line
    svg
      .append("path")
      .datum(data)
      .attr("class", "ma-line")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2)
      .attr("d", maLine)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Add MA line label
    svg
      .append("text")
      .attr("class", "ma-label")
      .attr("x", width - 130)
      .attr("y", yVolumeScale(data[data.length - 1].ma10) - 7)
      .text("10-day MA")
      .style("fill", "orange")
      .style("font-size", "11px")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1);
  }
};
