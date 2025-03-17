import styled from "styled-components";
import ThemeToggle from "../ThemeToggle";

const Header = ({ timeRange, setTimeRange }) => {
  return (
    <HeaderContainer>
      <Title>Stock Market Dashboard</Title>
      <TimeRangeSelector>
        {["1D", "1W", "1M", "3M", "1Y"].map((range) => (
          <TimeButton
            key={range}
            active={timeRange === range}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </TimeButton>
        ))}
      </TimeRangeSelector>
      <ThemeToggle />
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: bold;
  color: ${(props) => props.theme.text};

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    gap: 5px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const TimeButton = styled.button`
  padding: 5px 10px;
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

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 0.9rem;
    flex: 1;
    min-width: 40px;
  }
`;

export default Header;
