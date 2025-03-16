import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const CompanyTabs = ({ selectedCompany, setSelectedCompany }) => {
  return (
    <CompanyTabsContainer>
      {["AAPL", "TSLA", "AMZN", "MSFT", "GOOGL"].map((company) => (
        <CompanyTab
          key={company}
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          active={company === selectedCompany}
          onClick={() => setSelectedCompany(company)}
        >
          {company}
        </CompanyTab>
      ))}
    </CompanyTabsContainer>
  );
};

export default CompanyTabs;

const CompanyTabsContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 5px;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.secondary};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};
    border-radius: 10px;
  }
`;

const CompanyTab = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: ${(props) =>
    props.active ? props.theme.primary : props.theme.secondary};
  color: ${(props) => (props.active ? "white" : props.theme.text)};
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;
