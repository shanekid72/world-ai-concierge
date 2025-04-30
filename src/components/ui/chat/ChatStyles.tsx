import styled from 'styled-components';

export const StyledInputWrapper = styled.div`
  .grid {
    height: 200px;
    width: 400px;
    background-image: linear-gradient(to right, #0f0f10 1px, transparent 1px),
      linear-gradient(to bottom, #0f0f10 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .typing-indicator-container {
    display: inline-flex;
    align-items: center;
    column-gap: 5px;
    margin-left: 10px;
  }

  .typing-indicator {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #5e17eb;
    opacity: 0.4;
    animation: typing-animation 1s infinite;
  }

  .typing-indicator:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-indicator:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing-animation {
    0% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0.4;
      transform: scale(1);
    }
  }
`;

export const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: rgba(17, 17, 19, 0.7);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(94, 23, 235, 0.3);
  box-shadow: 0 0 15px rgba(94, 23, 235, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(94, 23, 235, 0.5);
    box-shadow: 0 0 20px rgba(94, 23, 235, 0.2);
  }
`;

export const StyledChatHeader = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(25, 25, 30, 0.5);
  border-bottom: 1px solid rgba(94, 23, 235, 0.2);
`;

export const StyledChatContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(94, 23, 235, 0.5) rgba(17, 17, 19, 0.3);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(17, 17, 19, 0.3);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(94, 23, 235, 0.5);
    border-radius: 10px;
  }
`;

export const StyledChatInputArea = styled.div`
  padding: 15px 20px;
  background-color: rgba(25, 25, 30, 0.5);
  border-top: 1px solid rgba(94, 23, 235, 0.2);
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const StyledChatInput = styled.input`
  flex: 1;
  background-color: rgba(35, 35, 40, 0.5);
  border: 1px solid rgba(94, 23, 235, 0.3);
  border-radius: 8px;
  padding: 12px 15px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(94, 23, 235, 0.7);
    box-shadow: 0 0 10px rgba(94, 23, 235, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

export const CyberpunkButtonWrapper = styled.button`
  position: relative;
  height: 62px;
  width: 200px;
  margin: 0;
  padding: 0;
  outline: none;
  color: #ffeba7;
  background-color: transparent;
  border: none;
  cursor: pointer;
  overflow: hidden;

  span {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(33, 33, 33, 0.8);
    box-shadow: 0 8px 24px 0 rgba(16, 39, 112, 0.2);
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.3s ease-in-out;

    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(16, 39, 112, 0.16);
      z-index: -2;
    }
    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #1f2029;
      z-index: -1;
      transition: all 0.3s ease-in-out;
    }
  }

  &:hover span:before {
    background-color: #102770;
  }

  &:active span:before {
    background-color: #0e1e5b;
    transition: all 50ms linear;
  }

  &.glitch {
    span {
      animation: glitch 0.4s linear;
    }
  }

  @keyframes glitch {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-4px, 4px);
    }
    40% {
      transform: translate(-4px, -4px);
    }
    60% {
      transform: translate(4px, 4px);
    }
    80% {
      transform: translate(4px, -4px);
    }
    100% {
      transform: translate(0);
    }
  }
`;

export const StyledButtonWrapper = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: rgba(100, 100, 255, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: transparent;
    }
    
    &:active {
      transform: none;
    }
  }
`;

export const ConnectionFeedContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: rgba(20, 20, 30, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(94, 23, 235, 0.3);
`;

export const FeedItem = styled.div<{ status: 'loading' | 'completed' }>`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px;
  background-color: ${(props) => props.status === 'completed' ? 'rgba(0, 180, 100, 0.1)' : 'rgba(94, 23, 235, 0.1)'};
  border-radius: 4px;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

export const PromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
`;

export const PromptOption = styled.div<{ isSelected?: boolean }>`
  padding: 12px 16px;
  background-color: ${(props) => props.isSelected ? 'rgba(94, 23, 235, 0.3)' : 'rgba(35, 35, 40, 0.7)'};
  border: 1px solid ${(props) => props.isSelected ? 'rgba(94, 23, 235, 0.8)' : 'rgba(94, 23, 235, 0.3)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(94, 23, 235, 0.2);
    border-color: rgba(94, 23, 235, 0.6);
  }
`;
