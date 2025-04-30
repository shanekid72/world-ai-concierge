import React from 'react';
import styled from 'styled-components';

interface PromptDisplayProps {
  prompts: string[];
}

const UpdatedPromptDisplay: React.FC<PromptDisplayProps> = ({ prompts }) => {
  if (!prompts || prompts.length === 0) {
    return null;
  }
  
  return (
    <StyledContainer>
      {prompts.map((prompt, index) => (
        <PromptItem key={index}>
          <PromptText>{prompt}</PromptText>
        </PromptItem>
      ))}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin-top: 1rem;
`;

const PromptItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  min-height: 40px;
`;

const PromptText = styled.pre`
  font-family: monospace;
  font-size: 0.75rem;
  color: #a0e4e8;
  white-space: pre-wrap;
  margin: 0;
  width: 100%;
`;

export default UpdatedPromptDisplay;
