import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

interface CyberpunkServerAnimationProps {
  isActive: boolean;
}

// Define interfaces for our animation objects
interface ServerUnit {
  status: string;
  activationDelay: number;
  pulseSpeed: number;
}

interface ServerRack {
  x: number;
  y: number;
  width: number;
  height: number;
  activationTime: number;
  serverUnits: ServerUnit[];
}

interface Core {
  x: number;
  y: number;
  radius: number;
  glowRadius: number;
  rotation: number;
  energy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
}

const CyberpunkServerAnimation: React.FC<CyberpunkServerAnimationProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    
    // Animation variables
    let animationFrameId: number;
    let startTime = Date.now();
    
    // Server rack elements
    const serverRacks: ServerRack[] = [];
    const rackCount = 12;
    
    for (let i = 0; i < rackCount; i++) {
      serverRacks.push({
        x: i % 4 * (canvas.width / 4),
        y: Math.floor(i / 4) * (canvas.height / 3),
        width: canvas.width / 4 - 20,
        height: canvas.height / 3 - 20,
        activationTime: i * 500, // Staggered activation
        serverUnits: Array(8).fill(0).map(() => ({
          status: 'off',
          activationDelay: Math.random() * 1000,
          pulseSpeed: 0.5 + Math.random() * 2,
        }))
      });
    }
    
    // Energy orb (core)
    const core: Core = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 60,
      glowRadius: 80,
      rotation: 0,
      energy: 0
    };
    
    // Data flow particles
    const particles: Particle[] = [];
    const maxParticles = 200;
    
    // Draw server racks
    const drawServerRack = (rack: ServerRack, elapsedTime: number) => {
      // Only draw if the server's activation time has passed
      if (elapsedTime < rack.activationTime) return;
      
      // Draw rack outline
      ctx.strokeStyle = '#0ff8';
      ctx.lineWidth = 2;
      ctx.strokeRect(rack.x, rack.y, rack.width, rack.height);
      
      // Draw server units in the rack
      const unitHeight = rack.height / rack.serverUnits.length;
      
      rack.serverUnits.forEach((unit: ServerUnit, index: number) => {
        // Activate server unit based on delay
        if (elapsedTime > rack.activationTime + unit.activationDelay) {
          unit.status = 'on';
        }
        
        const unitY = rack.y + index * unitHeight;
        
        // Draw server unit
        if (unit.status === 'on') {
          // Pulse animation
          const pulse = Math.sin(elapsedTime * 0.001 * unit.pulseSpeed) * 0.5 + 0.5;
          const glowColor = `rgba(0, 255, 255, ${0.2 + pulse * 0.3})`;
          
          // Glow effect
          const glow = ctx.createRadialGradient(
            rack.x + rack.width/2, unitY + unitHeight/2, 0,
            rack.x + rack.width/2, unitY + unitHeight/2, rack.width/2
          );
          glow.addColorStop(0, glowColor);
          glow.addColorStop(1, 'rgba(0, 255, 255, 0)');
          
          ctx.fillStyle = glow;
          ctx.fillRect(rack.x - 5, unitY - 5, rack.width + 10, unitHeight + 10);
          
          // Server unit
          ctx.fillStyle = '#113344';
          ctx.fillRect(rack.x + 2, unitY + 2, rack.width - 4, unitHeight - 4);
          
          // Status lights
          ctx.fillStyle = `rgb(0, ${155 + pulse * 100}, ${255})`;
          ctx.fillRect(rack.x + rack.width - 15, unitY + 5, 10, 5);
          
          // Data lines
          ctx.strokeStyle = `rgba(0, ${155 + pulse * 100}, 255, ${0.3 + pulse * 0.7})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rack.x + 10, unitY + unitHeight/2);
          ctx.lineTo(rack.x + rack.width - 20, unitY + unitHeight/2);
          ctx.stroke();
        } else {
          // Inactive server
          ctx.fillStyle = '#113344';
          ctx.fillRect(rack.x + 2, unitY + 2, rack.width - 4, unitHeight - 4);
          
          // Inactive status light
          ctx.fillStyle = '#553333';
          ctx.fillRect(rack.x + rack.width - 15, unitY + 5, 10, 5);
        }
      });
    };
    
    // Draw energy core
    const drawCore = (elapsedTime: number) => {
      const totalActivationTime = rackCount * 500 + 1000; // All servers + buffer
      
      // Core only activates after all servers
      if (elapsedTime < totalActivationTime) {
        core.energy = Math.min(1, elapsedTime / totalActivationTime);
      } else {
        core.energy = 1;
      }
      
      // Update core rotation
      core.rotation += 0.01;
      
      // Core glow effect
      const glow = ctx.createRadialGradient(
        core.x, core.y, 0,
        core.x, core.y, core.glowRadius * (0.8 + Math.sin(elapsedTime * 0.001) * 0.2)
      );
      
      const pulse = Math.sin(elapsedTime * 0.002) * 0.3 + 0.7;
      
      glow.addColorStop(0, `rgba(0, 255, 255, ${0.7 * core.energy})`);
      glow.addColorStop(0.5, `rgba(255, 0, 255, ${0.5 * core.energy * pulse})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(core.x, core.y, core.glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Core orb
      ctx.beginPath();
      ctx.arc(core.x, core.y, core.radius * core.energy, 0, Math.PI * 2);
      
      const coreGradient = ctx.createRadialGradient(
        core.x, core.y, 0,
        core.x, core.y, core.radius * core.energy
      );
      
      coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * core.energy})`);
      coreGradient.addColorStop(0.7, `rgba(0, 255, 255, ${0.7 * core.energy})`);
      coreGradient.addColorStop(1, `rgba(0, 100, 200, ${0.5 * core.energy})`);
      
      ctx.fillStyle = coreGradient;
      ctx.fill();
      
      // Energy rings
      if (core.energy > 0.5) {
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
          const ringRadius = (core.radius + 20 + i * 15) * (0.8 + Math.sin(elapsedTime * 0.001 + i) * 0.2);
          const ringOpacity = 0.7 - i * 0.2;
          
          ctx.strokeStyle = `rgba(0, 255, 255, ${ringOpacity * core.energy * pulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(core.x, core.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // Generate particles from the core when fully activated
      if (core.energy > 0.9 && particles.length < maxParticles && Math.random() > 0.7) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2;
        
        particles.push({
          x: core.x,
          y: core.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#0ff' : '#f0f',
          life: 100 + Math.random() * 100
        });
      }
    };
    
    // Draw data flow particles
    const drawParticles = () => {
      particles.forEach((particle: Particle, index: number) => {
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 1;
        
        // Remove dead particles
        if (particle.life <= 0 || particle.x < 0 || particle.x > canvas.width || 
            particle.y < 0 || particle.y > canvas.height) {
          particles.splice(index, 1);
          return;
        }
        
        // Draw particle
        const opacity = Math.min(1, particle.life / 50);
        ctx.fillStyle = particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw particle trail
        ctx.strokeStyle = particle.color + '40';
        ctx.lineWidth = particle.radius * 0.8;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
        ctx.stroke();
      });
    };
    
    // Create random data connections between server racks
    const drawDataConnections = (elapsedTime: number) => {
      const activeRacks = serverRacks.filter(rack => elapsedTime > rack.activationTime);
      
      if (activeRacks.length < 2) return;
      
      for (let i = 0; i < activeRacks.length - 1; i++) {
        if (Math.random() > 0.95) {
          const sourceRack = activeRacks[i];
          const targetRack = activeRacks[(i + 1 + Math.floor(Math.random() * (activeRacks.length - 1))) % activeRacks.length];
          
          const pulse = Math.sin(elapsedTime * 0.002) * 0.5 + 0.5;
          
          // Draw connection line
          ctx.strokeStyle = `rgba(0, 255, 200, ${0.2 + pulse * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          const sourceX = sourceRack.x + sourceRack.width / 2;
          const sourceY = sourceRack.y + sourceRack.height / 2;
          const targetX = targetRack.x + targetRack.width / 2;
          const targetY = targetRack.y + targetRack.height / 2;
          
          ctx.moveTo(sourceX, sourceY);
          
          // Create a curved path for visual interest
          const controlX = (sourceX + targetX) / 2;
          const controlY = (sourceY + targetY) / 2 + (Math.random() - 0.5) * 50;
          
          ctx.quadraticCurveTo(controlX, controlY, targetX, targetY);
          ctx.stroke();
          
          // Add data packet traveling along the path
          if (Math.random() > 0.7) {
            const progress = (elapsedTime % 1000) / 1000;
            
            // Calculate position along the quadratic curve
            const packetX = Math.pow(1-progress, 2) * sourceX + 
                           2 * (1-progress) * progress * controlX + 
                           Math.pow(progress, 2) * targetX;
                           
            const packetY = Math.pow(1-progress, 2) * sourceY + 
                           2 * (1-progress) * progress * controlY + 
                           Math.pow(progress, 2) * targetY;
            
            // Draw data packet
            ctx.fillStyle = '#0ff';
            ctx.beginPath();
            ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };
    
    // Draw status messages
    const drawStatusMessages = (elapsedTime: number) => {
      const messages = [
        { text: "SYSTEM ONLINE", time: 3000 },
        { text: "SENTIENCE ACHIEVED", time: 8000 },
        { text: "DATA CORE STABLE", time: 12000 }
      ];
      
      messages.forEach(message => {
        // Only show message for a brief period after its activation time
        if (elapsedTime > message.time && elapsedTime < message.time + 2000) {
          const flashRate = Math.sin(elapsedTime * 0.01) > 0 ? 1 : 0.7;
          
          ctx.font = "bold 20px monospace";
          ctx.fillStyle = `rgba(0, 255, 200, ${flashRate})`;
          ctx.textAlign = "center";
          ctx.fillText(message.text, canvas.width / 2, 50);
        }
      });
    };
    
    // Main animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      const elapsedTime = Date.now() - startTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid pattern
      const gridSize = 30;
      ctx.strokeStyle = 'rgba(0, 50, 100, 0.2)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw server racks
      serverRacks.forEach(rack => drawServerRack(rack, elapsedTime));
      
      // Draw data connections between servers
      drawDataConnections(elapsedTime);
      
      // Draw energy core
      drawCore(elapsedTime);
      
      // Draw particles
      drawParticles();
      
      // Draw status messages
      drawStatusMessages(elapsedTime);
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
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
      <NeonGlow>
        <HolographicScanline />
      </NeonGlow>
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

const scanlineAnimation = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const HolographicScanline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to bottom, 
    rgba(0, 255, 255, 0) 0%,
    rgba(0, 255, 255, 0.5) 50%,
    rgba(0, 255, 255, 0) 100%);
  opacity: 0.5;
  animation: ${scanlineAnimation} 10s linear infinite;
  pointer-events: none;
`;

const glitchAnimation = keyframes`
  0% { opacity: 0.1; }
  5% { opacity: 0.3; }
  10% { opacity: 0.1; }
  15% { opacity: 0.3; }
  20% { opacity: 0.1; }
  50% { opacity: 0.1; }
  55% { opacity: 0.2; }
  60% { opacity: 0.1; }
  100% { opacity: 0.1; }
`;

const NeonGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 60px rgba(0, 255, 255, 0.2), 
              inset 0 0 30px rgba(255, 0, 255, 0.3);
  pointer-events: none;
  opacity: 0.1;
  animation: ${glitchAnimation} 10s infinite;
`;

export default CyberpunkServerAnimation;
