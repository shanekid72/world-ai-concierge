import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Dolly3DAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Dolly3DAvatar({ 
  isListening = false, 
  isSpeaking = false,
  size = 'md'
}: Dolly3DAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const headRef = useRef<THREE.Mesh | null>(null);
  const eyesRef = useRef<THREE.Mesh[]>([]);
  const animationRef = useRef<number | null>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create cyberpunk materials
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0x001133,
      emissive: 0x001133,
      specular: 0x00ffff,
      shininess: 100,
    });

    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      specular: 0xffffff,
      shininess: 100,
    });

    // Create head geometry
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const head = new THREE.Mesh(headGeometry, headMaterial);
    headRef.current = head;
    scene.add(head);

    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    
    leftEye.position.set(-0.3, 0.2, 0.8);
    rightEye.position.set(0.3, 0.2, 0.8);
    
    eyesRef.current = [leftEye, rightEye];
    scene.add(leftEye);
    scene.add(rightEye);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Rotate head slightly
      if (headRef.current) {
        headRef.current.rotation.y += 0.01;
      }

      // Animate eyes
      eyesRef.current.forEach((eye, index) => {
        const time = Date.now() * 0.001;
        const blink = Math.sin(time * 2) > 0 ? 1 : 0.1;
        eye.scale.y = blink;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      sceneRef.current?.clear();
    };
  }, []);

  return (
    <motion.div
      className={`relative ${sizeClasses[size]}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      {/* Outer Ring - Pulse Animation */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyber-blue"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.2, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Voice Activity Indicator */}
      {(isListening || isSpeaking) && (
        <motion.div
          className={`absolute inset-0 rounded-full border-2 ${
            isListening ? 'border-cyber-blue' : 'border-cyber-accent'
          }`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.3, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* 3D Avatar Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-full overflow-hidden"
      />

      {/* Status Indicator */}
      <motion.div
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-cyber-blue shadow-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-cyber-blue"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
} 