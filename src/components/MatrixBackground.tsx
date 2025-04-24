import React, { useMemo } from 'react';
import styled from 'styled-components';

const MatrixBackground = () => {
  // Generate code lines once and reuse them with useMemo to improve performance
  const codeLines = useMemo(() => {
    const lines = [];
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789%$#@!';
    
    // Reduced number of code lines for better performance
    for (let i = 0; i < 40; i++) {
      const randomSpeed = Math.floor(Math.random() * 15) + 10; // More consistent speeds
      const randomX = Math.floor(Math.random() * 100); // Random X position (0-100%)
      const randomDelay = Math.floor(Math.random() * 5000); // Random delay for staggered animation start
      
      // Generate random characters for this line
      const chars = [];
      const numChars = Math.floor(Math.random() * 4) + 2; // 2-6 characters per line (reduced)
      
      for (let j = 0; j < numChars; j++) {
        const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
        chars.push(<p key={j} className="code">{randomChar}</p>);
      }
      
      lines.push(
        <span 
          key={i} 
          style={{
            '--i': randomSpeed,
            '--delay': `${randomDelay}ms`,
            left: `${randomX}%`,
          } as React.CSSProperties} 
          className="code-line"
        >
          {chars}
        </span>
      );
    }
    
    return lines;
  }, []); // Empty dependency array means this runs only once
  
  return (
    <StyledWrapper>
      <div className="matrix-container">
        {codeLines}
        <div className="overlay">
          <div className="button">worldAPI</div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .matrix-container {
    --clr-shadow__border: #A8DF8E;
    --clr-text: #F6F4EB;
    --clr-code-line: #43ff85;
    --clr-matrix: #020204;
    --size: 3rem;
    position: absolute;
    inset: 0;
    overflow: hidden;
    background-color: rgba(2, 2, 4, 0.9);
    width: 100%;
    height: 100%;
    will-change: transform; /* Performance hint to the browser */
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
    pointer-events: none;
  }
  
  .button {
    font-weight: 600;
    font-size: 1.5rem;
    letter-spacing: 0.2rem;
    color: var(--clr-text);
    padding: calc(var(--size) / 3) var(--size);
    background: transparent;
    border: none;
    text-shadow: 2px 0px var(--clr-shadow__border), 0px 2px var(--clr-shadow__border),
    -2px 0px var(--clr-shadow__border), 0px -2px var(--clr-shadow__border);
    pointer-events: none;
    opacity: 0.3;
  }

  .code-line {
    position: absolute;
    top: -50px; /* Start above the viewport */
    display: flex;
    flex-direction: column-reverse;
    min-height: 0.6rem;
    min-width: 0.6rem;
    animation-name: matrix-animation;
    animation-duration: calc(15s * var(--i) / 15);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-delay: var(--delay);
    transform: translate3d(0, 0, 0); /* Force GPU acceleration */
  }

  .code {
    text-shadow: 0 0 5px var(--clr-code-line);
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--clr-code-line);
    opacity: 0.5;
    margin: 0;
    padding: 0;
    line-height: 1;
  }

  .code:first-child {
    color: var(--clr-text);
    opacity: 1;
  }

  @keyframes matrix-animation {
    0% {
      transform: translate3d(0, -50px, 0);
    }
    100% {
      transform: translate3d(0, 100vh, 0);
    }
  }
`;

export default MatrixBackground;
