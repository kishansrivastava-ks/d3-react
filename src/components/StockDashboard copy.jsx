import React, { useState, useEffect, useContext, useRef } from "react";
import * as d3 from "d3";
import styled, { ThemeProvider, css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStockData,
  addStockData,
  deleteStockData,
} from "../utils/stockService";
import { ThemeContext } from "../context/ThemeContext";

import ThemeToggle from "../components/ThemeToggle";

// Chart types enum for cleaner code
const CHART_TYPES = {
  LINE: "line",
  CANDLESTICK: "candlestick",
  BAR: "bar",
  PIE: "pie",
};

const StockDashboard = () => {
  // State management
  const [selectedCompany, setSelectedCompany] = useState("AAPL");
  const [selectedChartType, setSelectedChartType] = useState(CHART_TYPES.LINE);
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState("1M"); // 1D, 1W, 1M, 3M, 1Y
  const [isLoading, setIsLoading] = useState(true);
  const [newData, setNewData] = useState({
    open: "",
    high: "",
    low: "",
    close: "",
    volume: "",
  });

  // Get theme from context
  const { theme } = useContext(ThemeContext);

  // Load data when component mounts or selectedCompany changes
  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay for demonstration
    setTimeout(() => {
      const fetchedData = getStockData(selectedCompany);
      setData(fetchedData);
      setIsLoading(false);
    }, 500);
  }, [selectedCompany, timeRange]);

  // Handle adding new data point
  const handleAddData = () => {
    // Validate inputs
    const formValues = Object.values(newData);
    if (formValues.some((val) => val === "")) {
      alert("Please fill all fields");
      return;
    }

    const newEntry = {
      timestamp: new Date().toISOString(),
      open: parseFloat(newData.open),
      high: parseFloat(newData.high),
      low: parseFloat(newData.low),
      close: parseFloat(newData.close),
      volume: parseInt(newData.volume, 10),
    };

    addStockData(selectedCompany, newEntry);
    setData((prevData) => [...prevData, newEntry]);

    // Reset form
    setNewData({
      open: "",
      high: "",
      low: "",
      close: "",
      volume: "",
    });
  };

  // Handle removing the last data point
  const handleRemoveLastData = () => {
    if (data.length === 0) return;

    const newData = [...data];
    const removedItem = newData.pop();
    deleteStockData(selectedCompany, removedItem.timestamp);
    setData(newData);
  };

  // Generate statistics for the selected company
  const getStatistics = () => {
    if (data.length === 0) return null;

    const latestClose = data[data.length - 1].close;
    const previousClose =
      data.length > 1 ? data[data.length - 2].close : data[0].open;
    const change = latestClose - previousClose;
    const percentChange = (change / previousClose) * 100;

    const highest = Math.max(...data.map((d) => d.high));
    const lowest = Math.min(...data.map((d) => d.low));
    const avgVolume = d3.mean(data, (d) => d.volume);

    return {
      latestClose: latestClose.toFixed(2),
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2),
      highest: highest.toFixed(2),
      lowest: lowest.toFixed(2),
      avgVolume: Math.round(avgVolume),
    };
  };

  const statistics = getStatistics();

  const handleSimulateLiveData = () => {
    const newData = generateLiveData(selectedCompany);
    if (newData) {
      setData([...data, newData]);
    }
  };

  return (
    <>
      <DashboardContainer>
        <Header>
          <Title>Stock Market Dashboard</Title>
          <TimeRangeSelector>
            {["1D", "1W", "1M", "3M", "1Y"].map((range) => (
              <TimeButton
                key={range}
                active={timeRange === range}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </TimeButton>
            ))}
          </TimeRangeSelector>
          <ThemeToggle />
        </Header>

        <CompanyTabs>
          {["AAPL", "TSLA", "AMZN", "MSFT", "GOOGL"].map((company) => (
            <CompanyTab
              key={company}
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              active={company === selectedCompany}
              onClick={() => setSelectedCompany(company)}
            >
              {company}
            </CompanyTab>
          ))}
        </CompanyTabs>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingOverlay
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Spinner />
              <span>Loading {selectedCompany} data...</span>
            </LoadingOverlay>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: "100%" }}
            >
              {data.length > 0 && (
                <StatisticsBar>
                  <StatItem isPositive={parseFloat(statistics.change) >= 0}>
                    <StatLabel>Last Price</StatLabel>
                    <StatValue>${statistics.latestClose}</StatValue>
                  </StatItem>
                  <StatItem isPositive={parseFloat(statistics.change) >= 0}>
                    <StatLabel>Change</StatLabel>
                    <StatValue>
                      {parseFloat(statistics.change) >= 0 ? "+" : ""}
                      {statistics.change} ({statistics.percentChange}%)
                    </StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>High</StatLabel>
                    <StatValue>${statistics.highest}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Low</StatLabel>
                    <StatValue>${statistics.lowest}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Avg Volume</StatLabel>
                    <StatValue>
                      {statistics.avgVolume.toLocaleString()}
                    </StatValue>
                  </StatItem>
                </StatisticsBar>
              )}

              <ChartControls>
                <ChartTypeTabs>
                  {Object.values(CHART_TYPES).map((type) => (
                    <ChartTypeButton
                      key={type}
                      active={type === selectedChartType}
                      onClick={() => setSelectedChartType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </ChartTypeButton>
                  ))}
                </ChartTypeTabs>
              </ChartControls>

              <ChartsContainer>
                <ChartWrapper
                  as={motion.div}
                  key={`${selectedCompany}-${selectedChartType}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StockChart
                    data={data}
                    chartType={selectedChartType}
                    theme={theme}
                  />
                </ChartWrapper>
              </ChartsContainer>

              <FormSection>
                <FormTitle>Add New Data Point</FormTitle>
                <Form>
                  {Object.keys(newData).map((key) => (
                    <InputGroup key={key}>
                      <Label htmlFor={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        step={key === "volume" ? 1 : 0.01}
                        placeholder={key}
                        value={newData[key]}
                        onChange={(e) =>
                          setNewData({ ...newData, [key]: e.target.value })
                        }
                      />
                    </InputGroup>
                  ))}
                  <ButtonGroup>
                    <ActionButton
                      as={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddData}
                    >
                      Add Data
                    </ActionButton>
                    <ActionButton
                      as={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRemoveLastData}
                      variant="secondary"
                    >
                      Remove Last
                    </ActionButton>
                    <ActionButton
                      as={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSimulateLiveData}
                      variant="primary"
                    >
                      Simulate Live Update
                    </ActionButton>
                  </ButtonGroup>
                </Form>
              </FormSection>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardContainer>
    </>
  );
};

// Enhanced chart component with multiple chart types
const StockChart = ({ data, chartType, theme }) => {
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

  // Line Chart Rendering Function
  const renderLineChart = (
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

  // Candlestick Chart Rendering Function
  const renderCandlestickChart = (
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

  // Bar Chart Rendering Function
  const renderBarChart = (svg, data, width, height, xScale, tooltip, theme) => {
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

  // Pie Chart Rendering Function
  const renderPieChart = (svg, data, width, height, tooltip, theme) => {
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

  return (
    <ChartContainer>
      <svg ref={chartRef}></svg>
      <div ref={tooltipRef} className="tooltip"></div>
    </ChartContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  transition: all 0.3s ease;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 10px;
`;

const TimeButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background: ${(props) =>
    props.active ? props.theme.primary : props.theme.secondary};
  color: ${(props) => (props.active ? "white" : props.theme.text)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? props.theme.primary : "#c0c0c0")};
  }
`;

const CompanyTabs = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 5px;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.secondary};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};
    border-radius: 10px;
  }
`;

const CompanyTab = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: ${(props) =>
    props.active ? props.theme.primary : props.theme.secondary};
  color: ${(props) => (props.active ? "white" : props.theme.text)};
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const LoadingOverlay = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  color: ${(props) => props.theme.text};
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${(props) => props.theme.secondary};
  border-top: 5px solid ${(props) => props.theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const StatisticsBar = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
  padding: 15px;
  background-color: ${(props) => props.theme.secondary};
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${(props) =>
    props.isPositive !== undefined &&
    css`
      color: ${props.isPositive
        ? props.theme.chart.candle.up
        : props.theme.chart.candle.down};
    `}
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  margin-bottom: 5px;
  opacity: 0.7;
`;

const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
`;

const ChartControls = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
`;

const ChartTypeTabs = styled.div`
  display: flex;
  gap: 10px;
`;

const ChartTypeButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background: ${(props) =>
    props.active ? props.theme.primary : props.theme.secondary};
  color: ${(props) => (props.active ? "white" : props.theme.text)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? props.theme.primary : "#c0c0c0")};
  }
`;

const ChartsContainer = styled.div`
  width: 100%;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
`;

const ChartWrapper = styled.div`
  width: 100%;
  background: ${(props) => props.theme.secondary};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

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

const FormSection = styled.div`
  width: 100%;
  margin-top: 30px;
  padding: 20px;
  background: ${(props) => props.theme.secondary};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  color: ${(props) => props.theme.text};
`;

const Form = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: ${(props) => props.theme.text};
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid ${(props) => props.theme.chart.grid};
  border-radius: 5px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  grid-column: 1 / -1;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: ${(props) =>
    props.variant === "secondary"
      ? props.theme.chart.candle.down
      : props.theme.primary};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

export default StockDashboard;
