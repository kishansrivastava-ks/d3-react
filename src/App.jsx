import StockDashboard from "./components/StockDashboard";
// import StockDataDisplay from "./components/StockDataDisplay";
import ThemeToggle from "./components/ThemeToggle";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* height: 100vh; */
  height: max-content;
`;

function App() {
  return (
    <Container>
      {/* <StockDataDisplay symbol="AAPL" /> */}
      {/* <StockDataDisplay symbol="TSLA" /> */}
      {/* <StockDataDisplay symbol="AMZN" /> */}
      <StockDashboard />
      {/* <ThemeToggle /> */}
    </Container>
  );
}

export default App;
