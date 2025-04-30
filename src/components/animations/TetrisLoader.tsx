import React from 'react';
import styled from 'styled-components';

const TetrisLoader = () => {
  return (
    <StyledWrapper>
      <div className="tetris-loader">
        <div className="tetris-container">
          <div className="block block-I">
            <div className="square" />
            <div className="square" />
            <div className="square" />
            <div className="square" />
          </div>
          <div className="block block-O">
            <div className="square" />
            <div className="square" />
            <div className="square" />
            <div className="square" />
          </div>
          <div className="block block-Z">
            <div className="square" />
            <div className="square" />
            <div className="square" />
            <div className="square" />
          </div>
          <div className="block block-L">
            <div className="square" />
            <div className="square" />
            <div className="square" />
            <div className="square" />
          </div>
        </div>
        <div className="grid-overlay" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .tetris-loader {
    width: 120px;
    height: 180px;
    position: relative;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
        rgba(255, 255, 255, 0.05) 1px,
        transparent 1px
      ),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }

  .tetris-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .block {
    display: grid;
    gap: 0px;
    position: absolute;
    filter: drop-shadow(0 0 4px currentColor);
    animation: fallDown 4s linear infinite;
  }

  .square {
    width: 20px;
    height: 20px;
    background-color: currentColor;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow:
      inset 2px 2px 2px rgba(255, 255, 255, 0.4),
      inset -2px -2px 2px rgba(0, 0, 0, 0.4);
  }

  .block-I {
    color: #00ffff;
    grid-template: repeat(4, 20px) / 20px;
    top: -80px;
    left: 40px;
    animation-delay: 0s;
  }

  .block-O {
    color: #ffff00;
    grid-template: repeat(2, 20px) / repeat(2, 20px);
    top: -40px;
    left: 60px;
    animation-delay: 1s;
  }

  .block-Z {
    color: #00ff9d;
    grid-template: repeat(2, 20px) / repeat(3, 20px);
    top: -40px;
    left: 20px;
    animation-delay: 2s;
  }

  .block-L {
    color: #ff3e3e;
    grid-template: repeat(3, 20px) / repeat(2, 20px);
    top: -60px;
    left: 0px;
    animation-delay: 3s;
  }

  .block-I .square:nth-child(1) {
    grid-area: 1 / 1;
  }
  .block-I .square:nth-child(2) {
    grid-area: 2 / 1;
  }
  .block-I .square:nth-child(3) {
    grid-area: 3 / 1;
  }
  .block-I .square:nth-child(4) {
    grid-area: 4 / 1;
  }

  .block-O .square:nth-child(1) {
    grid-area: 1 / 1;
  }
  .block-O .square:nth-child(2) {
    grid-area: 1 / 2;
  }
  .block-O .square:nth-child(3) {
    grid-area: 2 / 1;
  }
  .block-O .square:nth-child(4) {
    grid-area: 2 / 2;
  }

  .block-Z .square:nth-child(1) {
    grid-area: 1 / 1;
  }
  .block-Z .square:nth-child(2) {
    grid-area: 1 / 2;
  }
  .block-Z .square:nth-child(3) {
    grid-area: 2 / 2;
  }
  .block-Z .square:nth-child(4) {
    grid-area: 2 / 3;
  }

  .block-L .square:nth-child(1) {
    grid-area: 1 / 1;
  }
  .block-L .square:nth-child(2) {
    grid-area: 2 / 1;
  }
  .block-L .square:nth-child(3) {
    grid-area: 3 / 1;
  }
  .block-L .square:nth-child(4) {
    grid-area: 3 / 2;
  }

  .block-I {
    animation-name: fallDown-I;
  }
  .block-O {
    animation-name: fallDown-O;
  }
  .block-Z {
    animation-name: fallDown-Z;
  }
  .block-L {
    animation-name: fallDown-L;
  }

  @keyframes fallDown-I {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    60%,
    70% {
      transform: translateY(140px);
      opacity: 1;
    }
    100% {
      transform: translateY(140px);
      opacity: 0;
    }
  }

  @keyframes fallDown-O {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    60%,
    70% {
      transform: translateY(160px);
      opacity: 1;
    }
    100% {
      transform: translateY(160px);
      opacity: 0;
    }
  }

  @keyframes fallDown-Z {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    60%,
    70% {
      transform: translateY(180px);
      opacity: 1;
    }
    100% {
      transform: translateY(180px);
      opacity: 0;
    }
  }

  @keyframes fallDown-L {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    60%,
    70% {
      transform: translateY(180px);
      opacity: 1;
    }
    100% {
      transform: translateY(180px);
      opacity: 0;
    }
  }`;

export default TetrisLoader;
