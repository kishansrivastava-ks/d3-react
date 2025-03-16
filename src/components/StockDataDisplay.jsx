import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { getStockData, generateLiveData } from "../utils/stockService";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";

// Styled Components
const Container = styled.div`
  background: #1e1e2e;
  /* border-radius: 12px; */
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  color: #cdd6f4;
  font-family: "Inter", sans-serif;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Symbol = styled.span`
  color: #89b4fa;
  font-weight: 700;
`;

const RefreshIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #a6adc8;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #313244;
`;

const Tab = styled.button`
  background: ${(props) => (props.active ? "#313244" : "transparent")};
  color: ${(props) => (props.active ? "#cdd6f4" : "#a6adc8")};
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? "#313244" : "#2a2b3c")};
  }
`;

const TableContainer = styled.div`
  overflow-y: auto;
  border-radius: 8px;
  background: #181825;
  margin-top: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHeader = styled.th`
  position: sticky;
  top: 0;
  background: #1e1e2e;
  text-align: left;
  padding: 16px;
  color: #a6adc8;
  font-weight: 500;
  border-bottom: 1px solid #313244;
`;

const TableRow = styled(motion.tr)`
  border-bottom: 1px solid #313244;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #2a2b3c;
  }
`;

const TableCell = styled.td`
  padding: 16px;
`;

const PriceCell = styled(TableCell)`
  color: ${(props) =>
    props.change > 0 ? "#a6e3a1" : props.change < 0 ? "#f38ba8" : "#cdd6f4"};
  font-family: "JetBrains Mono", monospace;
`;

const PriceInfo = styled.div`
  margin-bottom: 20px;
`;

// Main Component
const StockDataDisplay = ({ symbol = "AAPL" }) => {
  const [stockData, setStockData] = useState(getStockData(symbol));
  const [timeframe, setTimeframe] = useState("1D");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayedData, setDisplayedData] = useState([]);

  // Calculate if price is up or down
  const currentPrice = stockData[stockData.length - 1]?.close || 0;
  const previousPrice = stockData[stockData.length - 2]?.close || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  useEffect(() => {
    // Update the displayed data based on the selected timeframe
    // For this example, we'll just show all data regardless of timeframe
    setDisplayedData([...stockData].reverse());
  }, [stockData, timeframe]);

  // Simulate real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);

      setTimeout(() => {
        const newData = generateLiveData(symbol);
        if (newData) {
          setStockData((prev) => [...prev, newData]);
        }
        setIsRefreshing(false);
      }, 1000);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [symbol]);

  return (
    <Container>
      <Header>
        <StyledTitle>
          <Symbol>{symbol}</Symbol> Stock Data
          {isPositive ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <ArrowUpCircle size={20} color="#a6e3a1" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <ArrowDownCircle size={20} color="#f38ba8" />
            </motion.div>
          )}
        </StyledTitle>
        <RefreshIndicator animate={{ opacity: isRefreshing ? 1 : 0.6 }}>
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "linear",
              repeatDelay: 0,
            }}
          >
            <RefreshCw size={16} />
          </motion.div>
          Live Updates
        </RefreshIndicator>
      </Header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PriceInfo>
          <span
            style={{ fontSize: "28px", fontWeight: "bold", marginRight: "8px" }}
          >
            ${currentPrice.toFixed(2)}
          </span>
          <motion.span
            style={{
              color: isPositive ? "#a6e3a1" : "#f38ba8",
              fontWeight: "medium",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)} ({isPositive ? "+" : ""}
            {priceChangePercent.toFixed(2)}%)
          </motion.span>
        </PriceInfo>
      </motion.div>

      <TabContainer>
        {["1D", "1W", "1M", "3M", "YTD", "1Y"].map((period) => (
          <Tab
            key={period}
            active={timeframe === period}
            onClick={() => setTimeframe(period)}
          >
            {period}
          </Tab>
        ))}
      </TabContainer>

      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <TableHeader>Timestamp</TableHeader>
              <TableHeader>Open</TableHeader>
              <TableHeader>High</TableHeader>
              <TableHeader>Low</TableHeader>
              <TableHeader>Close</TableHeader>
              <TableHeader>Volume</TableHeader>
              <TableHeader>Change</TableHeader>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {displayedData.map((entry, index) => {
                const prevClose =
                  index < displayedData.length - 1
                    ? displayedData[index + 1].close
                    : entry.close;
                const change = entry.close - prevClose;
                const changePercent = (change / prevClose) * 100;

                return (
                  <TableRow
                    key={entry.timestamp}
                    initial={{
                      opacity: 0,
                      backgroundColor: "rgba(166, 227, 161, 0.2)",
                    }}
                    animate={{
                      opacity: 1,
                      backgroundColor: "rgba(0, 0, 0, 0)",
                    }}
                    transition={{ duration: index === 0 ? 0.5 : 0.2 }}
                  >
                    <TableCell>
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <PriceCell change={0}>${entry.open.toFixed(2)}</PriceCell>
                    <PriceCell change={1}>${entry.high.toFixed(2)}</PriceCell>
                    <PriceCell change={-1}>${entry.low.toFixed(2)}</PriceCell>
                    <PriceCell change={change}>
                      ${entry.close.toFixed(2)}
                    </PriceCell>
                    <TableCell>{entry.volume.toLocaleString()}</TableCell>
                    <PriceCell change={change}>
                      {change > 0 ? "+" : ""}
                      {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                    </PriceCell>
                  </TableRow>
                );
              })}
            </AnimatePresence>
          </tbody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default StockDataDisplay;
