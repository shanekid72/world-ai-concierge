import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Group } from "three";

interface DollyAvatarProps {
  isSpeaking?: boolean;
  expression?: 'neutral' | 'happy' | 'angry' | 'surprised';
  position?: { x: number; y: number };
  gesture?: 'idle' | 'pointing' | 'thinking' | 'explaining';
}

function Model({ isSpeaking, expression = 'neutral', gesture = 'idle' }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF("/dolly-avatar.glb");

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  useFrame((state) => {
    if (group.current) {
      // Idle animation
      const t = state.clock.getElapsedTime();
      group.current.rotation.y = Math.sin(t / 4) * 0.2;
      if (isSpeaking) {
        group.current.position.y = Math.sin(t * 2) * 0.05;
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={2} position={[0, -2, 0]} />
    </group>
  );
}

export function DollyAvatar({ isSpeaking, expression, position, gesture }: DollyAvatarProps) {
  return (
    <div className="w-64 h-64 relative">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Model 
          isSpeaking={isSpeaking} 
          expression={expression}
          gesture={gesture}
        />
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