import React from 'react';
import styled from 'styled-components';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionCardProps {
  text: string;
  status: 'loading' | 'completed';
  id: number;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ text, status, id }) => {
  return (
    <motion.div
      layout
      key={id} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
    >
      <StyledCard className="card">
        <div className="card-content">
          <span className="connection-text">{text}</span>
          <AnimatePresence mode="wait">
            {status === 'loading' ? (
              <motion.div 
                key="loading" 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.5, opacity: 0 }} 
                transition={{ duration: 0.2 }}
                className="status-icon"
              >
                <Loader2 className="loader-icon" />
              </motion.div>
            ) : (
              <motion.div 
                key="completed" 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 0.2 }}
                className="status-icon"
              >
                <CheckCircle2 className="check-icon" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </StyledCard>
    </motion.div>
  );
};

const StyledCard = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 12px;
  padding: 8px 0;
  
  .card-content {
    width: 448px;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    z-index: 1;
    overflow: hidden;
  }

  .connection-text {
    font-size: 1rem;
    font-weight: 500;
    color: #fff; 
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.7), 0 0 12px rgba(0, 255, 255, 0.5);
    margin-right: 12px;
  }

  .status-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }

  .loader-icon {
    animation: spin 1.5s linear infinite;
    stroke-width: 2.5px;
    color: #ff56f6;
    filter: drop-shadow(0 0 4px rgba(255, 86, 246, 0.8));
  }

  .check-icon {
    stroke-width: 2.5px;
    color: #20ffb9;
    filter: drop-shadow(0 0 5px rgba(32, 255, 185, 0.8));
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default ConnectionCard;
