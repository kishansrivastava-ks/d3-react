import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import styled from "styled-components";
import { FaSun, FaMoon } from "react-icons/fa";

const ToggleButton = styled.button`
  /* position: fixed; */
  /* top: 1rem; */
  /* right: 18rem; */
  background: ${({ theme }) => theme.primary};
  color: #fff;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.secondary};
  }
`;

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <ToggleButton onClick={toggleTheme}>
      {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
    </ToggleButton>
  );
};

export default ThemeToggle;
