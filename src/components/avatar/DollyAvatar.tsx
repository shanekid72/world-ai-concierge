import React, { useEffect, useRef, Suspense, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Group, AnimationMixer, Clock, AnimationClip } from "three";
import * as THREE from 'three';
// @ts-ignore - Ignore TS error for FBXLoader import
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import useConversationStore, { ANIMATION_MAPPINGS } from '../../store/conversationStore';

interface DollyAvatarProps {
  position?: { x: number; y: number };
}

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ModelProps {
  clipName: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: { hasError: boolean };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Model = React.memo(({ clipName }: ModelProps) => {
  const group = useRef<Group>(null);
  
  // Available FBX avatar models
  const avatarModels = useMemo(() => [
    "/assets/avatars/Freehang Climb.fbx",
    "/assets/avatars/Body Block.fbx",
    "/assets/avatars/Golf Pre-Putt.fbx",
    "/assets/avatars/Hip Hop Dancing.fbx",
    "/assets/avatars/Jog In Circle.fbx",
    "/assets/avatars/Punching.fbx",
    "/assets/avatars/Talking On Phone.fbx",
    "/assets/avatars/Zombie Stand Up.fbx",
    "/assets/avatars/dolly-avatar.fbx"
  ], []);
  
  // State to keep track of current avatar model and index
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const currentModelPath = avatarModels[currentModelIndex];
  
  console.log("--- Model Component: Current model index:", currentModelIndex, "Path:", currentModelPath);

  // Use useLoader hook from react-three-fiber to load the FBX model
  const fbx = useLoader(FBXLoader, currentModelPath);
  
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  
  // Function to change avatar to the next model in sequence
  const changeAvatarModel = useCallback(() => {
    // Move to the next model in the sequence
    const nextIndex = (currentModelIndex + 1) % avatarModels.length;
    console.log("Changing avatar model to index:", nextIndex);
    setCurrentModelIndex(nextIndex);
  }, [avatarModels.length, currentModelIndex]);
  
  useEffect(() => {
    if (!fbx) return;
    
    fbx.traverse((child: any) => {
      if ('isMesh' in child && child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Get animations from the FBX file
    const animations = fbx.animations;
    console.log("Found animations:", animations.map((a: AnimationClip) => a.name));
    
    const mixer = new THREE.AnimationMixer(fbx);
    mixerRef.current = mixer;
    
    // Try to find an idle animation, or use the first animation if none is found
    const idleClip = animations.find((clip: AnimationClip) => clip.name.toLowerCase().includes('idle')) || animations[0];
    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.play();
      currentActionRef.current = action;
      console.log("Playing initial animation:", idleClip.name);
    }
    
    return () => {
      mixerRef.current?.stopAllAction();
    };
  }, [fbx]);
  
  useEffect(() => {
    if (!mixerRef.current || !fbx.animations || fbx.animations.length === 0 || !clipName) return;

    console.log(`Attempting to play animation for clipName: ${clipName}`);
    
    const animations = fbx.animations;
    const targetClip = animations.find((clip: AnimationClip) => 
        clip.name.toLowerCase().includes(clipName.toLowerCase())
    );

    const clipToPlay = targetClip || animations.find((clip: AnimationClip) => clip.name.toLowerCase().includes('idle')) || animations[0]; 
    
    if (clipToPlay && currentActionRef.current?.getClip() !== clipToPlay) {
       console.log("Switching animation to:", clipToPlay.name);
       const newAction = mixerRef.current.clipAction(clipToPlay);
       
       if (currentActionRef.current) {
         currentActionRef.current.fadeOut(0.3);
       }
       newAction.reset().fadeIn(0.3).play();
       currentActionRef.current = newAction; 
    } else if (clipToPlay) {
       currentActionRef.current?.play();
       console.log("Animation already set to:", clipToPlay.name);
    } else {
       console.warn(`Animation clip not found for: ${clipName}`);
    }

  }, [clipName, fbx]);
  
  // Periodically change the avatar model using fixed time intervals
  useEffect(() => {
    // Fixed time interval of 20 seconds per avatar model
    const FIXED_INTERVAL = 20000; // 20 seconds
    const intervalId = setInterval(changeAvatarModel, FIXED_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [changeAvatarModel]);
  
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });
  
  return (
    <group ref={group}>
      <primitive 
        object={fbx}
        scale={0.02} // FBX models often need scaling adjustment
        position={[0, -2.5, 0]}
        rotation={[0, 0, 0]} // Changed to face front
      />
    </group>
  );
});

Model.displayName = "DollyModel";

export function DollyAvatar() {
  const [currentAnimation, setCurrentAnimation] = useState('Idle');
  const [avatarPosition, setAvatarPosition] = useState({ top: '50%', left: '50%' });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const currentPositionRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const speedRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | NodeJS.Timeout | null>(null);

  const availableAnimations = useMemo(() => [
    'Idle', 'Talking', 'Thinking', 'Waving', 'Punching', 'ThumbsUp'
  ], []);

  const generateNewTarget = useCallback(() => {
    if (containerRef.current) {
      const avatarWidth = containerRef.current.offsetWidth;
      const avatarHeight = containerRef.current.offsetHeight;
      
      const maxX = window.innerWidth - avatarWidth;
      const maxY = window.innerHeight - avatarHeight;
      
      const randomX = Math.max(avatarWidth/2, Math.min(maxX - avatarWidth/2, Math.random() * maxX));
      const randomY = Math.max(avatarHeight/2, Math.min(maxY - avatarHeight/2, Math.random() * maxY));
      
      targetPositionRef.current = { x: randomX, y: randomY };
      
      if (Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * availableAnimations.length);
        setCurrentAnimation(availableAnimations[randomIndex]);
      }
    }
  }, [availableAnimations]);

  const animateFloat = useCallback(() => {
    const dx = targetPositionRef.current.x - currentPositionRef.current.x;
    const dy = targetPositionRef.current.y - currentPositionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      generateNewTarget();
    }
    
    const jitterX = (Math.random() - 0.5) * 0.05;
    const jitterY = (Math.random() - 0.5) * 0.05;
    
    speedRef.current.x = speedRef.current.x * 0.99 + (dx / 800) + jitterX;
    speedRef.current.y = speedRef.current.y * 0.99 + (dy / 800) + jitterY;
    
    const maxSpeed = 0.5;
    if (Math.abs(speedRef.current.x) > maxSpeed) {
      speedRef.current.x = Math.sign(speedRef.current.x) * maxSpeed;
    }
    if (Math.abs(speedRef.current.y) > maxSpeed) {
      speedRef.current.y = Math.sign(speedRef.current.y) * maxSpeed;
    }
    
    currentPositionRef.current.x += speedRef.current.x;
    currentPositionRef.current.y += speedRef.current.y;
    
    setAvatarPosition({ 
      top: `${currentPositionRef.current.y}px`, 
      left: `${currentPositionRef.current.x}px` 
    });
    
    animationFrameRef.current = setTimeout(() => {
      requestAnimationFrame(animateFloat);
    }, 16); 
  }, [generateNewTarget]);

  useEffect(() => {
    generateNewTarget();
    
    animationFrameRef.current = requestAnimationFrame(animateFloat);
    
    const intervalId = setInterval(generateNewTarget, 20000);
    
    const handleResize = () => {
      generateNewTarget();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, [generateNewTarget, animateFloat]);

  return (
    <div
      ref={containerRef}
      className="w-48 h-48 fixed z-50"
      style={{
        top: avatarPosition.top,
        left: avatarPosition.left,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none' 
      }}
    >
      <ErrorBoundary fallback={<div>Failed to load 3D model.</div>}>
        <Suspense fallback={<span>Loading Avatar...</span>}>
          <Canvas
            shadows
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: 'transparent', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          >
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} castShadow />
            
            <Model 
              clipName={currentAnimation}
            />

            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 1.8}
              minAzimuthAngle={-Math.PI / 4}
              maxAzimuthAngle={Math.PI / 4}
            />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 