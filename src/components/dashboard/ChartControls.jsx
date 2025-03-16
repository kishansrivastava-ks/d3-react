import React from "react";
import styled from "styled-components";

const CHART_TYPES = {
  LINE: "line",
  CANDLESTICK: "candlestick",
  BAR: "bar",
  PIE: "pie",
};

const ChartControls = ({ selectedChartType, setSelectedChartType }) => {
  return (
    <ChartControlsContainer>
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
    </ChartControlsContainer>
  );
};

// Export CHART_TYPES for use in other components
// export { CHART_TYPES };
export default ChartControls;

const ChartControlsContainer = styled.div`
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
