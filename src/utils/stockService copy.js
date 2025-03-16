import { mockStockData } from "../data/mockStockData";

export const getStockData = (symbol) => {
  return mockStockData[symbol]?.data || [];
};

// Function to add real-time updates
export const addStockData = (symbol, newData) => {
  if (mockStockData[symbol]) {
    mockStockData[symbol].data.push(newData);
  }
};

// Generate random real-time data for simulation
export const generateLiveData = (symbol) => {
  const lastData = mockStockData[symbol]?.data.slice(-1)[0];
  if (!lastData) return null;

  const newTimestamp = new Date(
    Date.parse(lastData.timestamp) + 30 * 60000
  ).toISOString(); // +30 min
  const fluctuation = (Math.random() - 0.5) * 5; // Random price change
  const newClose = Math.max(50, lastData.close + fluctuation); // Keep values realistic
  const newHigh = Math.max(newClose, lastData.high + Math.random() * 2);
  const newLow = Math.min(lastData.low - Math.random() * 2, newClose);
  const newVolume = lastData.volume + Math.floor(Math.random() * 50000);

  const newData = {
    timestamp: newTimestamp,
    open: lastData.close,
    high: newHigh,
    low: newLow,
    close: newClose,
    volume: newVolume,
    sma_50: (lastData.sma_50 + newClose) / 2,
    ema_20: (lastData.ema_20 + newClose) / 2,
    sentiment: Math.random(), // Mock AI sentiment score (0 to 1)
  };

  addStockData(symbol, newData);
  return newData;
};
