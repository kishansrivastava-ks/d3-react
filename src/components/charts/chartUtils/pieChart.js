import * as d3 from "d3";

export const renderPieChart = (svg, data, width, height, tooltip, theme) => {
  // Use the latest data point
  const latestData = data[data.length - 1];

  // Create data for pie chart (showing open/close/high/low distribution)
  const pieData = [
    { label: "Open", value: latestData.open },
    { label: "High-Open", value: latestData.high - latestData.open },
    { label: "Close-Low", value: latestData.close - latestData.low },
    {
      label: "Other Range",
      value:
        latestData.high -
        latestData.low -
        (latestData.high - latestData.open) -
        (latestData.close - latestData.low),
    },
  ];

  // Filter out negative or zero values
  const filteredPieData = pieData.filter((d) => d.value > 0);

  // Compute position - center of the chart
  const radius = Math.min(width, height) / 3;
  const centerX = width / 2;
  const centerY = height / 2;

  // Create color scale
  const color = d3
    .scaleOrdinal()
    .domain(filteredPieData.map((d) => d.label))
    .range(theme.chart.pie);

  // Create pie layout
  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  // Create arc generator
  const arc = d3
    .arc()
    .innerRadius(0) // Full pie
    .outerRadius(radius);

  // Create arc for hover state
  const arcHover = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius * 1.1);

  // Create arc for labels
  const labelArc = d3
    .arc()
    .innerRadius(radius * 1.15)
    .outerRadius(radius * 1.15);

  // Add pie chart title specifically
  svg
    .append("text")
    .attr("class", "pie-title")
    .attr("text-anchor", "middle")
    .attr("x", centerX)
    .attr("y", centerY - radius - 30)
    .text(`Price Distribution on ${latestData.date.toLocaleDateString()}`)
    .style("fill", theme.text)
    .style("font-size", "16px");

  // Create pie chart
  const pieG = svg
    .append("g")
    .attr("transform", `translate(${centerX}, ${centerY})`);

  // Add slices
  const slices = pieG
    .selectAll(".arc")
    .data(pie(filteredPieData))
    .enter()
    .append("g")
    .attr("class", "arc");

  // Add path elements (slices)
  slices
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label))
    .attr("stroke", theme.background)
    .attr("stroke-width", 2)
    .style("opacity", 0.9)
    .on("mouseover", function (event, d) {
      // Enlarge slice
      d3.select(this).transition().duration(200).attr("d", arcHover);

      // Show tooltip
      tooltip
        .style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px").html(`
            <strong>${d.data.label}:</strong> $${d.data.value.toFixed(2)}<br>
            <strong>Percentage:</strong> ${
              ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100
            }%
          `);
    })
    .on("mouseout", function () {
      // Restore slice size
      d3.select(this).transition().duration(200).attr("d", arc);

      // Hide tooltip
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .attrTween("d", function (d) {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arc(interpolate(t));
      };
    });

  // Add labels
  slices
    .append("text")
    .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .text((d) => `${d.data.label}: $${d.data.value.toFixed(2)}`)
    .style("fill", theme.text)
    .style("font-size", "12px")
    .style("opacity", 0)
    .transition()
    .delay(1000) // Start after pie animation
    .duration(500)
    .style("opacity", 1);

  // Add legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 150}, ${height - 100})`);

  filteredPieData.forEach((d, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    legendRow
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(d.label));

    legendRow
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(d.label)
      .style("font-size", "12px")
      .style("fill", theme.text);
  });

  // Add center circle with latest info
  pieG
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius * 0.5)
    .attr("fill", theme.background)
    .attr("stroke", theme.chart.axes)
    .attr("stroke-width", 1)
    .style("opacity", 0)
    .transition()
    .delay(1000)
    .duration(500)
    .style("opacity", 1);

  // Add center text
  pieG
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", -15)
    .text(`Close: $${latestData.close.toFixed(2)}`)
    .style("fill", theme.text)
    .style("font-size", "14px")
    .style("opacity", 0)
    .transition()
    .delay(1100)
    .duration(500)
    .style("opacity", 1);

  pieG
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", 15)
    .text(`Range: $${(latestData.high - latestData.low).toFixed(2)}`)
    .style("fill", theme.text)
    .style("font-size", "14px")
    .style("opacity", 0)
    .transition()
    .delay(1200)
    .duration(500)
    .style("opacity", 1);
};
