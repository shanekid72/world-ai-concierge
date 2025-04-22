import React, { useEffect, useRef, Suspense, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, useFBX } from "@react-three/drei";
import { Group, Object3D, Mesh, AnimationMixer, AnimationClip, Clock } from "three";
import * as THREE from 'three';

interface DollyAvatarProps {
  isSpeaking?: boolean;
  expression?: 'neutral' | 'happy' | 'angry' | 'surprised';
  position?: { x: number; y: number };
  gesture?: 'idle' | 'pointing' | 'thinking' | 'explaining';
}

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ModelProps {
  isSpeaking?: boolean;
  expression?: 'neutral' | 'happy' | 'angry' | 'surprised';
  gesture?: 'idle' | 'pointing' | 'thinking' | 'explaining';
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

// Create a memoized Model component to prevent re-renders
const Model = React.memo(({ isSpeaking, expression = 'neutral', gesture = 'idle' }: ModelProps) => {
  const group = useRef<Group>(null);
  const modelPath = "/assets/avatars/Talking On Phone.fbx";
  
  // Log only on first render
  const isFirstRender = useRef(true);
  if (isFirstRender.current) {
    console.log("Loading model from path:", modelPath);
    isFirstRender.current = false;
  }
  
  // Memoize the FBX model to prevent reloading
  const fbx = useMemo(() => useFBX(modelPath), [modelPath]);
  
  // Animation setup
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const [animationIndex, setAnimationIndex] = useState(0);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect for initial setup - run only once
  useEffect(() => {
    if (!fbx) return;
    
    // Set up mesh properties
    fbx.traverse((child: Object3D) => {
      if ('isMesh' in child && child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    if (fbx.animations && fbx.animations.length > 0) {
      console.log("Found animations:", fbx.animations.length);
      
      // Create the mixer
      const mixer = new THREE.AnimationMixer(fbx);
      mixerRef.current = mixer;
      
      // Play the first animation
      const action = mixer.clipAction(fbx.animations[0]);
      action.play();
      
      // Set up a timer to switch animations occasionally
      animationTimerRef.current = setInterval(() => {
        if (fbx.animations.length > 1) {
          const nextIndex = (animationIndex + 1) % fbx.animations.length;
          setAnimationIndex(nextIndex);
          
          mixer.stopAllAction();
          const newAction = mixer.clipAction(fbx.animations[nextIndex]);
          newAction.fadeIn(0.5);
          newAction.play();
        }
      }, 8000); // Change animation every 8 seconds
    }
    
    // Cleanup function
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [fbx]); // Only depend on fbx
  
  // Effect for responding to user interactions - only run when props change
  useEffect(() => {
    if (!mixerRef.current || !fbx || !fbx.animations || fbx.animations.length === 0) return;
    
    // Choose an animation based on the current state
    let animToPlay = 0;
    
    if (isSpeaking) {
      // Use the first animation for speaking
      animToPlay = 0;
    } else if (gesture === 'thinking') {
      // Use animation 1 for thinking if available
      animToPlay = fbx.animations.length > 1 ? 1 : 0;
    }
    
    if (animToPlay !== animationIndex) {
      setAnimationIndex(animToPlay);
      
      mixerRef.current.stopAllAction();
      const action = mixerRef.current.clipAction(fbx.animations[animToPlay]);
      action.reset();
      action.fadeIn(0.5);
      action.play();
    }
  }, [isSpeaking, expression, gesture, fbx]); // Important props that should trigger animation changes
  
  // Animation frame update
  useFrame(() => {
    if (mixerRef.current) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
    }
  });
  
  return (
    <group ref={group}>
      <primitive 
        object={fbx} 
        scale={0.01} 
        position={[0, -1.5, 0]} 
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
});

// Add display name for debugging
Model.displayName = "DollyModel";

export function DollyAvatar({ isSpeaking, expression, position, gesture }: DollyAvatarProps) {
  // Prevent re-rendering of the Canvas component
  const canvasProps = useMemo(() => ({
    shadows: true,
    camera: { position: [0, 0, 5] as [number, number, number], fov: 45 },
    style: {
      background: 'transparent',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    },
    gl: {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true
    }
  }), []);

  return (
    <div className="w-full h-full relative bg-gradient-radial from-cyber-avatar-bg-from to-cyber-avatar-bg-to opacity-80 shadow-avatar-glow shadow-cyber-avatar-glow rounded-full overflow-hidden">
      <Canvas {...canvasProps}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} castShadow />
        <Suspense fallback={null}>
          <ErrorBoundary fallback={null}>
            <Model 
              isSpeaking={isSpeaking} 
              expression={expression}
              gesture={gesture}
            />
          </ErrorBoundary>
        </Suspense>
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
} 