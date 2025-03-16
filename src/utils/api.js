// src/api.js
const API_KEY = import.meta.env.VITE_API_KEY;

const fetchStockData = async (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=demo`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${symbol}`);
  }

  const data = await response.json();

  if (!data["Time Series (Daily)"]) {
    throw new Error("Invalid data format from API");
  }

  return Object.entries(data["Time Series (Daily)"])
    .map(([date, values]) => ({
      date,
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseInt(values["6. volume"], 10),
    }))
    .reverse(); // Ensure oldest data comes first
};

export { fetchStockData };
