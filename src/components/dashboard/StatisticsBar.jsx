import React from "react";
import styled, { css } from "styled-components";

const StatisticsBar = ({ statistics }) => {
  return (
    <StatisticsBarContainer>
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
        <StatValue>{statistics.avgVolume.toLocaleString()}</StatValue>
      </StatItem>
    </StatisticsBarContainer>
  );
};

export default StatisticsBar;

const StatisticsBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
  padding: 15px;
  background-color: ${(props) => props.theme.secondary};
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 15px 5px;
    justify-content: space-around;
  }

  @media (max-width: 480px) {
    padding: 12px 8px;
  }
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

  @media (max-width: 768px) {
    width: 45%;
    margin-bottom: 5px;
  }

  @media (max-width: 480px) {
    width: 49%;
  }
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  margin-bottom: 5px;
  opacity: 0.7;

  @media (max-width: 480px) {
    font-size: 0.7rem;
    margin-bottom: 3px;
  }
`;
const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: bold;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;
