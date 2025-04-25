import styled from 'styled-components';

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  isTyping?: boolean;
}

export default function ChatMessage({ message, isAI, isTyping = false }: ChatMessageProps) {
  return (
    <MessageWrapper 
      $isAI={isAI}
      data-component-name="ChatMessage"
    >
      <AvatarContainer $isAI={isAI}>
        <div className="avatar-glow" />
        <div className="avatar-border" />
        <div className="avatar-bg" />
        <div className="avatar-content">
          {isAI ? (
            <span className="avatar-text">AI</span>
          ) : (
            <span className="avatar-text">YOU</span>
          )}
        </div>
      </AvatarContainer>

      <ContentContainer $isAI={isAI} data-component-name="ChatMessage">
        <HeaderBar $isAI={isAI} data-component-name="ChatMessage">
          <SenderName $isAI={isAI}>
            {isAI ? 'DOLLY.AI' : ''}
          </SenderName>
          <Separator $isAI={isAI} data-component-name="ChatMessage" />
        </HeaderBar>

        {isTyping ? (
          <TypingIndicator>
            <span></span>
            <span></span>
            <span></span>
          </TypingIndicator>
        ) : (
          <MessageText $isAI={isAI} data-component-name="ChatMessage">
            {message}
          </MessageText>
        )}
      </ContentContainer>
    </MessageWrapper>
  );
}

const MessageWrapper = styled.div<{ $isAI: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: ${props => props.$isAI ? '2px solid #32D1D1' : '1px solid #4880DE'};
  background-color: ${props => props.$isAI ? 'rgba(0, 30, 60, 0.8)' : 'rgba(72, 128, 222, 0.08)'};
  box-shadow: ${props => props.$isAI ? '0 0 25px rgba(50, 209, 209, 0.4), inset 0 0 15px rgba(50, 209, 209, 0.2)' : '0 0 20px rgba(72, 128, 222, 0.15)'};
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${props => props.$isAI ? '3px' : '2px'};
    background: linear-gradient(
      90deg,
      transparent,
      ${props => props.$isAI ? '#32D1D1' : '#4880DE'} 50%,
      transparent
    );
    opacity: ${props => props.$isAI ? '1' : '0.5'};
  }
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${props => props.$isAI ? '#32D1D1' : '#4880DE'} 50%,
      transparent
    );
    opacity: 0.3;
  }
`;

const AvatarContainer = styled.div<{ $isAI: boolean }>`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .avatar-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${props => props.$isAI ? '#32D1D1' : '#4880DE'};
    opacity: 0.5;
    filter: blur(6px);
    z-index: 1;
  }

  .avatar-border {
    position: absolute;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    border-radius: 50%;
    border: 1px solid ${props => props.$isAI ? '#32D1D1' : '#4880DE'};
    z-index: 2;
  }

  .avatar-bg {
    position: absolute;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border-radius: 50%;
    background: ${props => props.$isAI 
      ? 'linear-gradient(135deg, #1A2C31, #0E1A1F)' 
      : 'linear-gradient(135deg, #1A2A49, #0E1730)'};
    z-index: 3;
  }

  .avatar-content {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-text {
    font-family: monospace;
    font-weight: bold;
    font-size: 11px;
    color: ${props => props.$isAI ? '#32D1D1' : '#4880DE'};
  }
`;

const ContentContainer = styled.div<{ $isAI: boolean }>`
  flex: 1;
  min-width: 0;
`;

const HeaderBar = styled.div<{ $isAI: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const SenderName = styled.span<{ $isAI: boolean }>`
  font-weight: bold;
  font-size: 14px;
  color: ${props => props.$isAI ? '#32D1D1' : '#4880DE'};
`;

const Separator = styled.div<{ $isAI: boolean }>`
  flex: 1;
  height: 1px;
  background: ${props => props.$isAI 
    ? 'linear-gradient(90deg, #32D1D180, transparent)' 
    : 'linear-gradient(90deg, #4880DE80, transparent)'};
`;

const MessageText = styled.p<{ $isAI: boolean }>`
  font-size: 14px;
  color: ${props => props.$isAI ? '#FFFFFF' : '#B8D0FF'};
  word-break: break-word;
  line-height: 1.5;
  text-shadow: ${props => props.$isAI ? '0 0 10px rgba(50, 209, 209, 0.8)' : '0 0 8px rgba(72, 128, 222, 0.4)'};
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #32D1D1;
    opacity: 0.8;
    display: inline-block;
    animation: typingAnimation 1.5s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: 0s;
    }
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes typingAnimation {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.8;
    }
    30% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }
`;