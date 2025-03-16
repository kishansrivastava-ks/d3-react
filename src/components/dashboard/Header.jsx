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
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 10px;
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
`;

export default Header;
