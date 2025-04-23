import React, { useEffect, useRef, Suspense, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Group, Object3D, Mesh, AnimationMixer, AnimationClip, Clock } from "three";
import * as THREE from 'three';
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
  const modelPath = "/assets/avatars/dolly_avatar.glb";
  
  console.log("--- Model Component: Attempting to load ---", modelPath);

  const { scene, animations } = useGLTF(modelPath);
  
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  
  useEffect(() => {
    if (!scene || !animations || animations.length === 0) return;
    
    scene.traverse((child: Object3D) => {
      if ('isMesh' in child && child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    console.log("Found animations:", animations.map(a => a.name));
    
    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;
    
    const idleClip = animations.find(clip => clip.name.toLowerCase().includes('idle')) || animations[0];
    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.play();
      currentActionRef.current = action;
      console.log("Playing initial animation:", idleClip.name);
    }
    
    return () => {
      mixerRef.current?.stopAllAction();
    };
  }, [scene, animations]);
  
  useEffect(() => {
    if (!mixerRef.current || !animations || animations.length === 0 || !clipName) return;

    console.log(`Attempting to play animation for clipName: ${clipName}`);
    
    const targetClip = animations.find(clip => 
        clip.name.toLowerCase().includes(clipName.toLowerCase())
    );

    const clipToPlay = targetClip || animations.find(clip => clip.name.toLowerCase().includes('idle')) || animations[0]; 
    
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

  }, [clipName, animations]);
  
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });
  
  return (
    <group ref={group}>
      <primitive 
        object={scene}
        scale={2.5}
        position={[0, -2.5, 0]}
        rotation={[0, Math.PI * 0.75, 0]}
      />
    </group>
  );
});

Model.displayName = "DollyModel";

export function DollyAvatar() {
  const [currentAnimation, setCurrentAnimation] = useState('Idle');
  const [avatarPosition, setAvatarPosition] = useState({ top: '50%', left: '50%' });
  const containerRef = useRef<HTMLDivElement>(null);

  const availableAnimations = useMemo(() => [
    'Idle', 'Talking', 'Thinking', 'Waving', 'Punching', 'ThumbsUp'
  ], []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Select a random animation
      const randomIndex = Math.floor(Math.random() * availableAnimations.length);
      setCurrentAnimation(availableAnimations[randomIndex]);

      // Calculate random position within the viewport
      if (containerRef.current) {
        const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const maxX = parentRect.width - containerRef.current.offsetWidth;
          const maxY = parentRect.height - containerRef.current.offsetHeight;
          const randomX = Math.max(0, Math.floor(Math.random() * maxX));
          const randomY = Math.max(0, Math.floor(Math.random() * maxY));
          setAvatarPosition({ top: `${randomY}px`, left: `${randomX}px` });
        } else {
          const randomTop = Math.random() * 80 + 10;
          const randomLeft = Math.random() * 80 + 10;
          setAvatarPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [availableAnimations]);

  return (
    <div
      ref={containerRef}
      className="w-48 h-48 absolute bg-gradient-radial from-cyber-avatar-bg-from to-cyber-avatar-bg-to opacity-90 shadow-avatar-glow shadow-cyber-avatar-glow rounded-full overflow-hidden transition-all duration-1000 ease-in-out"
      style={{
        top: avatarPosition.top,
        left: avatarPosition.left,
        transform: 'translate(-50%, -50%)'
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