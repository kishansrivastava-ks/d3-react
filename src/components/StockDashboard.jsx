import React, { useState, useEffect, useContext, useRef } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStockData,
  addStockData,
  deleteStockData,
  generateLiveData,
} from "../utils/stockService";
import { ThemeContext } from "../context/ThemeContext";

import ThemeToggle from "./ThemeToggle";
import { StockChart } from "./charts/StockChart";
import Header from "./dashboard/Header";
import CompanyTabs from "./dashboard/CompanyTabs";
import StatisticsBar from "./dashboard/StatisticsBar";
import ChartControls from "./dashboard/ChartControls";

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

  const timeoutRef = useRef(null);

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

  useEffect(() => {
    // Clear any existing timeout when the effect runs again
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout and store its ID
    timeoutRef.current = setTimeout(() => {
      const newData = generateLiveData(selectedCompany);
      if (newData) {
        setData((prevData) => [...prevData, newData]);
      }
    }, 5000);

    // Clean up on unmount or before the effect runs again
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedCompany, data]);

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
        <Header timeRange={timeRange} setTimeRange={setTimeRange} />

        <CompanyTabs
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
        />

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
              {data.length > 0 && <StatisticsBar statistics={statistics} />}

              <ChartControls
                selectedChartType={selectedChartType}
                setSelectedChartType={setSelectedChartType}
              />

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

  @media (max-width: 768px) {
    padding: 10px;
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

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const FormSection = styled.div`
  width: 100%;
  margin-top: 30px;
  padding: 20px;
  background: ${(props) => props.theme.secondary};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 15px;
  }
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

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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
  width: 100%;

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

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
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

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default StockDashboard;
