import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { motion } from 'framer-motion';

interface Dolly3DAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  position?: { x: number; y: number };
}

export function Dolly3DAvatar({ 
  isListening = false, 
  isSpeaking = false,
  position = { x: 0, y: 0 }
}: Dolly3DAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) {
      setError('Container not initialized');
      return;
    }

    try {
      // Basic scene setup
      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(0, 1.5, 4);
      camera.lookAt(0, 1, 0);

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(400, 500);
      renderer.setClearColor(0x000000, 0);
      renderer.setClearAlpha(0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      containerRef.current.appendChild(renderer.domElement);

      // Basic lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Update test cube to be semi-transparent while loading
      const testCube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ 
          color: 0x00ff00,
          transparent: true,
          opacity: 0.5
        })
      );
      testCube.position.set(0, 0, 0);
      scene.add(testCube);

      // Load FBX model
      console.log('Starting FBX load...');
      const loader = new FBXLoader();
      
      // Add timestamp to bypass cache
      const modelPath = `${window.location.origin}/assets/avatars/Talking On Phone.fbx?v=${Date.now()}`;
      console.log('Attempting to load from:', modelPath);

      loader.load(
        modelPath,
        (fbx) => {
          console.log('FBX loaded successfully');
          try {
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(fbx);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            fbx.position.x = -center.x;
            fbx.position.y = -center.y;
            fbx.position.z = -center.z;
            
            const scale = 0.05; // FBX models are often much larger
            fbx.scale.set(scale, scale, scale);

            // Enable shadows
            fbx.traverse((node) => {
              if (node instanceof THREE.Mesh) {
                node.castShadow = true;
                node.receiveShadow = true;
              }
            });

            scene.add(fbx);
            scene.remove(testCube); // Remove test cube once model loads
            setLoading(false);
            console.log('Model added to scene');

            // Handle animations if present
            if (fbx.animations && fbx.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(fbx);
              const idleAction = mixer.clipAction(fbx.animations[0]);
              idleAction.play();

              // Update animation in render loop
              const clock = new THREE.Clock();
              const animate = () => {
                requestAnimationFrame(animate);
                const delta = clock.getDelta();
                mixer.update(delta);
                renderer.render(scene, camera);
              };
              animate();
            } else {
              // Simple render loop if no animations
              const animate = () => {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
              };
              animate();
            }
          } catch (err) {
            console.error('Error processing model:', err);
            setError('Error processing 3D model: ' + (err as Error).message);
          }
        },
        (xhr) => {
          const progress = (xhr.loaded / xhr.total) * 100;
          console.log('Loading progress:', progress + '%');
          setLoadingProgress(progress);
        },
        (error) => {
          console.error('Error loading FBX:', error);
          setError('Failed to load 3D model: ' + error.message);
        }
      );

      return () => {
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.error('Setup error:', err);
      setError('Failed to initialize 3D viewer: ' + (err as Error).message);
    }
  }, []);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <div className="text-cyan-400 mb-2">Loading 3D model... {loadingProgress.toFixed(1)}%</div>
          <div className="w-48 h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-cyan-400 rounded-full transition-all duration-300" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-red-500 p-4 bg-black rounded">
            {error}
            <br/>
            <button 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <motion.div
        ref={containerRef}
        className="fixed w-[400px] h-[500px] pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        }}
      />
    </div>
  );
} 