# Stock Market Data Visualization Dashboard

## 📌 Project Overview

This project is a **dynamic stock market data visualization dashboard** built using **React.js, D3.js, React Query,UseState and Styled Components**. It allows users to view interactive charts for multiple stock market symbols, add new data points, and visualize real-time stock market trends.

## 🚀 Features

- **Multiple Stock Charts**: Line Chart, Candlestick Chart, Bar Chart, Pie Chart
- **Company Selection Tabs**: Switch between AAPL, TSLA, AMZN
- **Real-time Data Simulation**: New stock data points appear live
- **Tooltips & Interactivity**: Hover effects show precise data values
- **Zoom & Pan**: Users can zoom and explore chart details
- **Dark/Light Mode**: Theme toggling with persistent storage
- **Stock Data Input**: Users can manually add stock values (real time chart updates with smooth transitions)
- **Modular & Clean Code**: Organized structure with reusable components
- **Fully responsive for mobile screen**

## 🛠️ Tech Stack

- **Frontend**: React.js (with Vite), Styled Components
- **Visualization**: D3.js (for interactive SVG charts)
- **State Management**: React Query (for stock data fetching & caching) and UseState
- **Theming**: Context API & Styled Components (for dark/light mode)
- **Mock API**: Local JSON-based stock data service

## 📂 Folder Structure

```
/src
 ├── /components
 │    ├── /charts (Contains all chart components and utility functions)
 │    ├── /dashboard (for all dashboard components like stats, header, form, controls etc)
 │    ├── StockDataInput.jsx (Manual data entry form)
 │    ├── StockDashboard.jsx (Main dashboard component)
 ├── /services
 │    ├── stockService.js (Handles stock data fetching & updates)
 ├── /context
 │    ├── ThemeContext.jsx (Manages dark/light mode)
 ├── /data
 │    ├── mockStockData.js (mock data for the visualizations)
 ├── /hooks
 │    ├── useStockDara.js (custom hook to fetch data and store it in react query if an external api is used)
 ├── /styles
 │    ├── theme.js (Defines theme colors & chart styles)
 │    ├── GlobalStyles.js (to define the global styles)
 ├── App.jsx
 ├── main.jsx
```

## 🔧 Installation & Running Locally

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/your-username/stock-dashboard.git
cd stock-dashboard
```

### **2️⃣ Install Dependencies**

```sh
npm install
```

### **3️⃣ Start the Development Server**

```sh
npm run dev
```

The project will be available at **`http://localhost:5173/`** (default Vite port).

## 📊 How It Works

1. **Select a Stock** → Click on the tabs to switch between AAPL, TSLA, AMZN
2. **View Real-time Charts** → Stocks update automatically every few seconds.
3. **Add New Data** → Enter stock values in the form to simulate new data points.
4. **Interact with Charts** → Hover, zoom, and pan for detailed insights.
5. **Toggle Dark/Light Mode** → Click the theme switch button (top right corner).

📌 Important D3.js Methods Used

The project extensively uses D3.js for chart rendering and interactivity. Some key methods:

d3.select() → Selects an HTML or SVG element to manipulate.

d3.scaleTime() → Creates a time-based scale for the x-axis.

d3.scaleLinear() → Creates a linear scale for numerical values on the y-axis.

d3.axisBottom() / d3.axisLeft() → Generates x-axis and y-axis with proper formatting.

d3.line() → Draws a line path for the stock prices.

d3.zoom() → Enables zooming and panning on charts.

d3.transition() → Adds smooth animations when updating chart elements.

d3.extent() → Computes the minimum and maximum values for a dataset.

d3.tip() → (Custom tooltip) Displays additional stock data on hover.
