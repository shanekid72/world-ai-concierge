import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import CodeCard from './CodeCard';
import CampfireScene from './CampfireScene';
import TetrisLoader from './TetrisLoader';
import CyberSquares from './CyberSquares';

// Define animation components with proper typing
const ANIMATIONS = [
  { component: CodeCard, minWidth: 250, minHeight: 300, id: 'code-card' },
  { component: CampfireScene, minWidth: 400, minHeight: 300, id: 'campfire' },
  { component: TetrisLoader, minWidth: 120, minHeight: 180, id: 'tetris' },
  { component: CyberSquares, minWidth: 200, minHeight: 200, id: 'cyber-squares' }
];

interface AnimationInstance {
  id: string;
  component: React.ComponentType;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface BackgroundAnimationsProps {
  isActive: boolean;
}

const BackgroundAnimations: React.FC<BackgroundAnimationsProps> = ({ isActive }) => {
  const [animations, setAnimations] = useState<AnimationInstance[]>([]);
  const [viewportSize, setViewportSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1200, 
    height: typeof window !== 'undefined' ? window.innerHeight : 800 
  });

  // Update viewport size on window resize
  useEffect(() => {
    const updateSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial size
    updateSize();

    // Add resize listener
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Add and remove animations when active
  useEffect(() => {
    if (!isActive) {
      setAnimations([]);
      return;
    }

    // Initial animations - add one of each type
    const setupAnimations = () => {
      const newAnimations: AnimationInstance[] = [];
      
      // Add one of each animation at random positions
      ANIMATIONS.forEach((animType) => {
        const padding = 50;
        const maxX = viewportSize.width - animType.minWidth - padding;
        const maxY = viewportSize.height - animType.minHeight - padding;
        
        // Ensure we only place animations in visible areas
        const xPos = Math.max(padding, Math.floor(Math.random() * maxX));
        const yPos = Math.max(padding, Math.floor(Math.random() * maxY));
        
        const scale = 0.6 + Math.random() * 0.4;
        const rotation = Math.random() * 10 - 5;
        
        newAnimations.push({
          id: `anim-${Date.now()}-${Math.random()}`,
          component: animType.component,
          position: { x: xPos, y: yPos },
          scale,
          rotation
        });
      });
      
      setAnimations(newAnimations);
    };

    // Set up animations right away
    setupAnimations();
    
    return () => {
      setAnimations([]);
    };
  }, [isActive, viewportSize.width, viewportSize.height]);

  // Don't render anything if not active
  if (!isActive) return null;

  return (
    <AnimationsContainer>
      <AnimatePresence>
        {animations.map((anim) => (
          <AnimationWrapper
            key={anim.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: anim.scale,
              x: anim.position.x,
              y: anim.position.y,
              rotate: anim.rotation
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.8 }}
          >
            <anim.component />
          </AnimationWrapper>
        ))}
      </AnimatePresence>
    </AnimationsContainer>
  );
};

const AnimationsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
`;

const AnimationWrapper = styled(motion.div)`
  position: absolute;
  filter: drop-shadow(0 0 15px rgba(0, 255, 200, 0.3));
  pointer-events: none;
`;

export default BackgroundAnimations;
