import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import ConnectionCard from './StyledConnectionCard';
import MatrixBackground from './MatrixBackground';

interface FeedItemState {
  id: number;
  text: string;
  status: 'loading' | 'completed';
}

interface CyberpunkInitializationProps {
  feedItems: FeedItemState[];
  isConnecting: boolean;
}

// Holographic displays with scrolling data
const HolographicDisplay: React.FC<{position: [number, number, number]}> = ({ position }) => {
  const displayRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (displayRef.current) {
      // Holographic display floating and slight rotation
      displayRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.1;
      displayRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });
  
  return (
    <mesh ref={displayRef} position={position} rotation={[0, Math.PI / 6, 0]}>
      <planeGeometry args={[2, 1, 1]} />
      <meshStandardMaterial 
        color="#00FFFF" 
        emissive="#00FFFF"
        emissiveIntensity={0.5}
        transparent={true} 
        opacity={0.3} 
      />
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.05}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {`MISSION: WORLDAPI\nINITIALIZING NODES...\nLOADING QUANTUM CORES...\nCONFIGURING NEURAL NETWORKS...\nACTIVATING CYBERNETIC SYSTEMS...`}
      </Text>
    </mesh>
  );
};

// Cyberpunk city-like grid floor
const CyberGrid: React.FC = () => {
  const gridRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (gridRef.current && gridRef.current.material) {
      // Animate the grid
      (gridRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 
        0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });
  
  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[40, 40, 40, 40]} />
      <meshStandardMaterial 
        color="#001133"
        wireframe={true}
        emissive="#00FFFF"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

// Main scene
const Scene: React.FC = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set camera position
    camera.position.set(0, 1, 5);
  }, [camera]);
  
  useFrame(({ clock }) => {
    // Slowly orbit camera around the scene
    const radius = 5;
    const speed = 0.1;
    camera.position.x = Math.sin(clock.getElapsedTime() * speed) * radius;
    camera.position.z = Math.cos(clock.getElapsedTime() * speed) * radius;
    camera.lookAt(0, 0, 0);
  });
  
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <fog attach="fog" args={['#000020', 5, 30]} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      <CyberGrid />
      <HolographicDisplay position={[2, 0.5, -1]} />
      <HolographicDisplay position={[-2, 0, -1]} />
    </>
  );
};

// Feed items display that shows the connection progress with styled cards
const FeedItemsDisplay: React.FC<{feedItems: FeedItemState[]}> = ({ feedItems }) => {
  return (
    <div className="w-full max-w-md space-y-3 z-20 relative">
      {feedItems.map((item) => (
        <ConnectionCard 
          key={item.id}
          id={item.id}
          text={item.text}
          status={item.status}
        />
      ))}
    </div>
  );
};

const CyberpunkInitialization: React.FC<CyberpunkInitializationProps> = ({ feedItems, isConnecting }) => {
  return (
    <div className="tech-animation-container h-full overflow-hidden custom-scrollbar rounded bg-cyber-darker border border-cyber-deep-teal/40 shadow-inner flex flex-col items-center justify-center relative">
      {/* Matrix-style background */}
      <div className="absolute inset-0 z-0 matrix-bg-container">
        <MatrixBackground />
      </div>
      
      {/* 3D background scene */}
      <div className="absolute inset-0 z-10 opacity-75">
        <Canvas shadows>
          <Scene />
        </Canvas>
      </div>
      
      {/* Overlay content */}
      <div className="z-20 relative flex flex-col items-center justify-center p-6 text-center w-full">
        <motion.h3 
          className="text-lg font-bold text-cyber-light-teal mb-6 neon-text relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <span className="text-2xl inline-block">Initializing Connection</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
          >...</motion.span>
        </motion.h3>
        
        <FeedItemsDisplay feedItems={feedItems} />
        
        {isConnecting && (
          <motion.div 
            className="mt-6 px-4 py-2 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(0, 255, 255, 0.5)', '0 0 20px rgba(0, 255, 255, 0.8)', '0 0 0px rgba(0, 255, 255, 0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white font-bold px-4 py-2 rounded-full bg-cyber-deep-teal/80 border-2 border-cyan-300 backdrop-blur-sm"
              style={{
                textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
                letterSpacing: '0.5px'
              }}
            >
              Establishing secure connection to WorldAPI nodes
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CyberpunkInitialization;
