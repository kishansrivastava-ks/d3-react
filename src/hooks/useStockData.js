import { useQuery } from "@tanstack/react-query";

const fetchStockData = async (symbol) => {
  const API_KEY = import.meta.env.VITE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`;
  //   const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=demo`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch stock data");
  }
  return response.json();
};

export const useStockData = (symbol) => {
  return useQuery({
    queryKey: ["stockData", symbol],
    queryFn: () => fetchStockData(symbol),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
