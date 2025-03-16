import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import StockChart from "../charts/StockChart";

const ChartsContainer = ({
  selectedCompany,
  selectedChartType,
  data,
  theme,
}) => {
  return (
    <ChartsContainerWrapper>
      <ChartWrapper
        as={motion.div}
        key={`${selectedCompany}-${selectedChartType}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <StockChart data={data} chartType={selectedChartType} theme={theme} />
      </ChartWrapper>
    </ChartsContainerWrapper>
  );
};

export default ChartsContainer;

const ChartsContainerWrapper = styled.div`
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
`;
