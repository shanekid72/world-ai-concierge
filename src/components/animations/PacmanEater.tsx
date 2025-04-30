import React from 'react';
import styled, { keyframes } from 'styled-components';

// Simple component that renders a Pacman that eats text
const PacmanEater: React.FC = () => {
  return (
    <Container>
      <PacmanShape />
    </Container>
  );
};

const chomp = keyframes`
  0% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
  49% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
  50% { clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%, 0% 0%); }
  100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
`;

const move = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(8px); }
`;

const Container = styled.div`
  position: absolute;
  left: -25px;
  top: 50%;
  transform: translateY(-50%);
  animation: ${move} 0.5s infinite alternate ease-in-out;
  z-index: 100;
`;

const PacmanShape = styled.div`
  width: 24px;
  height: 24px;
  background-color: #FFEB3B;
  border-radius: 50%;
  animation: ${chomp} 0.4s infinite linear;
`;

export default PacmanEater;
