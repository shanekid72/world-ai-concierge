import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

interface CyberpunkGridAnimationProps {
  isActive: boolean;
}

const CyberpunkGridAnimation: React.FC<CyberpunkGridAnimationProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    
    let animationFrameId: number;
    const startTime = Date.now();
    
    // Grid parameters
    const gridSize = 40;
    const perspectiveDepth = 4;
    
    // Energy pulses
    interface Pulse {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
      hue: number;
    }
    
    const pulses: Pulse[] = [];
    const maxPulses = 8;
    
    // Binary code rain
    interface CodeDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      chars: string[];
      color: string;
    }
    
    const codeDrops: CodeDrop[] = [];
    const maxDrops = 20;
    
    // Generate random character
    const getRandomChar = (): string => {
      const chars = '01';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    };
    
    // Add code drops
    const addCodeDrop = () => {
      if (codeDrops.length < maxDrops && Math.random() > 0.95) {
        const length = 5 + Math.floor(Math.random() * 15);
        const chars: string[] = [];
        
        // Generate random binary characters
        for (let i = 0; i < length; i++) {
          chars.push(getRandomChar());
        }
        
        codeDrops.push({
          x: Math.random() * canvas.width,
          y: 0,
          speed: 1 + Math.random() * 3,
          length,
          chars,
          color: Math.random() > 0.7 ? '#0ff' : '#f0f'
        });
      }
    };
    
    // Add energy pulse
    const addPulse = () => {
      if (pulses.length < maxPulses && Math.random() > 0.97) {
        pulses.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 5 + Math.random() * 20,
          alpha: 0.8,
          speed: 0.5 + Math.random() * 2,
          hue: Math.random() > 0.5 ? 180 : 300 // Cyan or Pink
        });
      }
    };
    
    // Draw perspective grid
    const drawGrid = (timestamp: number) => {
      const gridTime = timestamp * 0.0005;
      
      // Draw horizontal grid lines with perspective effect
      ctx.lineWidth = 1;
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        // Calculate perspective factor (farther lines are thinner)
        const distance = Math.abs(y - canvas.height / 2);
        const perspective = 1 - Math.min(0.8, distance / (canvas.height / 2));
        
        // Pulse effect
        const pulse = 0.3 + Math.sin(gridTime + y * 0.01) * 0.2;
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * perspective * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw vertical grid lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        const distance = Math.abs(x - canvas.width / 2);
        const perspective = 1 - Math.min(0.8, distance / (canvas.width / 2));
        
        const pulse = 0.3 + Math.sin(gridTime + x * 0.01) * 0.2;
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * perspective * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw diagonal depth lines for 3D effect
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 1; i <= perspectiveDepth; i++) {
        const depth = i / perspectiveDepth;
        const pulse = 0.4 + Math.sin(gridTime * 2) * 0.2;
        
        ctx.strokeStyle = `rgba(255, 0, 255, ${pulse * (1 - depth) * 0.7})`;
        ctx.lineWidth = 1;
        
        // Draw radiating lines from center
        const lineCount = 16;
        for (let j = 0; j < lineCount; j++) {
          const angle = (j / lineCount) * Math.PI * 2;
          
          const startX = centerX + Math.cos(angle) * gridSize * i;
          const startY = centerY + Math.sin(angle) * gridSize * i;
          
          const endX = centerX + Math.cos(angle) * gridSize * (i + 1);
          const endY = centerY + Math.sin(angle) * gridSize * (i + 1);
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }
    };
    
    // Draw energy pulses
    const drawPulses = () => {
      pulses.forEach((pulse, index) => {
        // Expand and fade out
        pulse.size += pulse.speed;
        pulse.alpha -= 0.01;
        
        if (pulse.alpha <= 0) {
          pulses.splice(index, 1);
          return;
        }
        
        // Draw pulse circle
        const gradient = ctx.createRadialGradient(
          pulse.x, pulse.y, 0,
          pulse.x, pulse.y, pulse.size
        );
        
        gradient.addColorStop(0, `hsla(${pulse.hue}, 100%, 70%, ${pulse.alpha})`);
        gradient.addColorStop(0.7, `hsla(${pulse.hue}, 100%, 50%, ${pulse.alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${pulse.hue}, 100%, 50%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    
    // Draw binary code rain
    const drawCodeRain = () => {
      codeDrops.forEach((drop, index) => {
        drop.y += drop.speed;
        
        // Remove drops that go off screen
        if (drop.y > canvas.height) {
          codeDrops.splice(index, 1);
          return;
        }
        
        // Draw characters
        ctx.font = '14px monospace';
        
        drop.chars.forEach((char, charIndex) => {
          const charY = drop.y - charIndex * 14;
          
          // Only draw if in view
          if (charY > 0 && charY < canvas.height) {
            // Characters fade as they get farther from the head
            const alpha = 1 - (charIndex / drop.length);
            
            ctx.fillStyle = `${drop.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fillText(char, drop.x, charY);
            
            // Randomly change characters sometimes
            if (Math.random() > 0.95) {
              drop.chars[charIndex] = getRandomChar();
            }
          }
        });
      });
    };
    
    // Draw glowing edges
    const drawGlowingEdges = (timestamp: number) => {
      const time = timestamp * 0.001;
      const glow = Math.sin(time) * 0.5 + 0.5;
      
      ctx.lineWidth = 3;
      
      // Top edge
      const topGradient = ctx.createLinearGradient(
        canvas.width / 2, 0,
        canvas.width / 2, 10
      );
      topGradient.addColorStop(0, `rgba(0, 255, 255, ${glow * 0.8})`);
      topGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      
      ctx.strokeStyle = topGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();
      
      // Bottom edge with pink glow
      const bottomGradient = ctx.createLinearGradient(
        canvas.width / 2, canvas.height,
        canvas.width / 2, canvas.height - 10
      );
      bottomGradient.addColorStop(0, `rgba(255, 0, 255, ${glow * 0.8})`);
      bottomGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
      
      ctx.strokeStyle = bottomGradient;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();
    };
    
    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      const now = Date.now();
      const elapsed = now - startTime;
      
      // Clear canvas with semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 20, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid with perspective effect
      drawGrid(elapsed);
      
      // Draw glowing edges
      drawGlowingEdges(elapsed);
      
      // Add and draw code rain
      addCodeDrop();
      drawCodeRain();
      
      // Add and draw energy pulses
      addPulse();
      drawPulses();
      
      // Continue animation
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <AnimationContainer>
      <Canvas ref={canvasRef} />
      <Overlay />
      <Scanline />
    </AnimationContainer>
  );
};

const AnimationContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 20, 0) 0%,
    rgba(0, 0, 20, 0.4) 100%
  );
  pointer-events: none;
`;

const scanlineAnimation = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const Scanline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 255, 255, 0.5) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  opacity: 0.3;
  animation: ${scanlineAnimation} 6s linear infinite;
  pointer-events: none;
  z-index: 2;
`;

export default CyberpunkGridAnimation;
