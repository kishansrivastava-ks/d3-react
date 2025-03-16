import { mockStockData } from "../data/mockStockData";

/**
 * Get stock data for a specific symbol
 * @param {string} symbol - Stock symbol (e.g., AAPL)
 * @returns {Array} Array of stock data points or empty array if not found
 */
export const getStockData = (symbol) => {
  if (!symbol || typeof symbol !== "string") {
    console.error("Invalid symbol provided to getStockData");
    return [];
  }
  return mockStockData[symbol]?.data || [];
};

/**
 * Add new data point to existing stock data
 * @param {string} symbol - Stock symbol
 * @param {Object} newData - New data point to add
 * @returns {boolean} Success status
 */
export const addStockData = (symbol, newData) => {
  if (!symbol || !newData || typeof newData !== "object") {
    console.error("Invalid parameters provided to addStockData");
    return false;
  }

  // Validate required fields
  const requiredFields = [
    "timestamp",
    "open",
    "high",
    "low",
    "close",
    "volume",
  ];
  const missingFields = requiredFields.filter(
    (field) => !newData.hasOwnProperty(field)
  );

  if (missingFields.length > 0) {
    console.error(
      `Missing required fields in newData: ${missingFields.join(", ")}`
    );
    return false;
  }

  // Validate data types and relationships
  if (
    newData.high < newData.low ||
    newData.open < newData.low ||
    newData.open > newData.high ||
    newData.close < newData.low ||
    newData.close > newData.high
  ) {
    console.error("Invalid price relationships in provided data");
    return false;
  }

  if (!mockStockData[symbol]) {
    mockStockData[symbol] = { data: [] };
  }

  mockStockData[symbol].data.push(newData);
  return true;
};

/**
 * Delete a data point from existing stock data
 * @param {string} symbol - Stock symbol
 * @param {string} timestamp - Timestamp of the data point to delete
 * @returns {boolean} Success status
 */
export const deleteStockData = (symbol, timestamp) => {
  if (!symbol || !timestamp) {
    console.error("Invalid parameters provided to deleteStockData");
    return false;
  }

  if (!mockStockData[symbol]) {
    console.error(`Symbol ${symbol} not found`);
    return false;
  }

  const initialLength = mockStockData[symbol].data.length;
  mockStockData[symbol].data = mockStockData[symbol].data.filter(
    (item) => item.timestamp !== timestamp
  );

  return mockStockData[symbol].data.length < initialLength;
};

/**
 * Generate random real-time data for simulation
 * @param {string} symbol - Stock symbol
 * @returns {Object|null} New data point or null if error
 */
export const generateLiveData = (symbol) => {
  if (!symbol || !mockStockData[symbol] || !mockStockData[symbol].data.length) {
    console.error(`Cannot generate live data for symbol ${symbol}`);
    return null;
  }

  const lastData =
    mockStockData[symbol].data[mockStockData[symbol].data.length - 1];

  // Create timestamp 30 minutes after the last one
  const newTimestamp = new Date(
    new Date(lastData.timestamp).getTime() + 30 * 60000
  ).toISOString();

  // Generate realistic price fluctuations (usually within ±2%)
  const volatility = 0.02; // 2% volatility
  const randomChange = (Math.random() - 0.5) * 2 * volatility;
  const percentChange = 1 + randomChange;

  const newClose = parseFloat((lastData.close * percentChange).toFixed(2));
  // High should be at least the open or close, whichever is higher
  const baseHigh = Math.max(lastData.close, newClose);
  const newHigh = parseFloat(
    (baseHigh * (1 + (Math.random() * volatility) / 2)).toFixed(2)
  );
  // Low should be at most the open or close, whichever is lower
  const baseLow = Math.min(lastData.close, newClose);
  const newLow = parseFloat(
    (baseLow * (1 - (Math.random() * volatility) / 2)).toFixed(2)
  );

  // Volume tends to follow price volatility
  const volumeChange = 1 + Math.abs(randomChange) * 10;
  const newVolume = Math.floor(lastData.volume * (0.7 + volumeChange * 0.3));

  // Compute realistic technical indicators
  const sma50 = lastData.sma_50
    ? parseFloat(((lastData.sma_50 * 49 + newClose) / 50).toFixed(2))
    : newClose;
  const alpha = 2 / (20 + 1); // Smoothing factor for EMA
  const ema20 = lastData.ema_20
    ? parseFloat((newClose * alpha + lastData.ema_20 * (1 - alpha)).toFixed(2))
    : newClose;

  // Sentiment is more likely to be positive on up days, negative on down days
  const baseSentiment = newClose > lastData.close ? 0.6 : 0.4;
  const sentiment = parseFloat(
    (baseSentiment + (Math.random() - 0.5) * 0.4).toFixed(2)
  );

  const newData = {
    timestamp: newTimestamp,
    open: parseFloat(lastData.close.toFixed(2)),
    high: newHigh,
    low: newLow,
    close: newClose,
    volume: newVolume,
    sma_50: sma50,
    ema_20: ema20,
    sentiment: sentiment,
  };

  addStockData(symbol, newData);
  return newData;
};

/**
 * Get available stock symbols
 * @returns {Array} Array of available stock symbols
 */
export const getAvailableSymbols = () => {
  return Object.keys(mockStockData);
};

/**
 * Get summary statistics for a symbol
 * @param {string} symbol - Stock symbol
 * @returns {Object|null} Statistics object or null if not available
 */
export const getStockStats = (symbol) => {
  const data = getStockData(symbol);
  if (!data.length) return null;

  const latest = data[data.length - 1];
  const earliest = data[0];
  const highestPoint = Math.max(...data.map((d) => d.high));
  const lowestPoint = Math.min(...data.map((d) => d.low));
  const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;

  // Calculate overall performance
  const overallChange = latest.close - earliest.open;
  const overallPercentChange = (overallChange / earliest.open) * 100;

  return {
    symbol,
    latestPrice: latest.close,
    dailyChange: latest.close - latest.open,
    dailyPercentChange: ((latest.close - latest.open) / latest.open) * 100,
    overallChange,
    overallPercentChange,
    highestPoint,
    lowestPoint,
    avgVolume: Math.floor(avgVolume),
    dataPoints: data.length,
    firstDate: new Date(earliest.timestamp).toLocaleDateString(),
    lastDate: new Date(latest.timestamp).toLocaleDateString(),
  };
};
