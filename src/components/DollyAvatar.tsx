import React, { useRef, useMemo, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import { BufferGeometry } from 'three';

interface DollyAvatarProps {
  /** 
   * Name of the animation clip to play, 
   * e.g. 'Walk', 'Happy', 'Thinking', etc.
   */
  clipName?: string;
}

// Helper function to triangulate geometry
const triangulateGeometry = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        // Ensure we're using indexed buffer geometry
        if (!mesh.geometry.index) {
          mesh.geometry = mesh.geometry.toNonIndexed();
        }
      }
    }
  });
};

// Helper function to limit skin weights to 4
const limitSkinWeights = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
      const mesh = child as THREE.SkinnedMesh;
      if (mesh.geometry && mesh.geometry.attributes.skinWeight) {
        const skinWeightAttr = mesh.geometry.attributes.skinWeight;
        const skinWeightArray = skinWeightAttr.array;
        
        for (let i = 0; i < skinWeightArray.length; i += 4) {
          // Normalize weights to ensure sum is 1
          let sum = 0;
          for (let j = 0; j < 4; j++) {
            sum += skinWeightArray[i + j];
          }
          if (sum > 0) {
            for (let j = 0; j < 4; j++) {
              skinWeightArray[i + j] /= sum;
            }
          }
        }
      }
    }
  });
};

const DollyAvatar: React.FC<DollyAvatarProps> = ({ clipName }) => {
  // List available FBX files
  const fbxPaths = useMemo(
    () => [
      '/assets/avatars/dolly-avatar.fbx',
      '/assets/avatars/Jog In Circle.fbx',
      '/assets/avatars/Punching.fbx',
      '/assets/avatars/Hip Hop Dancing.fbx',
      '/assets/avatars/Talking On Phone.fbx',
      '/assets/avatars/Zombie Stand Up.fbx',
      '/assets/avatars/Body Block.fbx',
      '/assets/avatars/Freehang Climb.fbx',
      '/assets/avatars/Golf Pre-Putt.fbx',
    ],
    []
  );

  // Load models with loader options to handle errors
  const models = useLoader(FBXLoader, fbxPaths, (loader) => {
    // Set any loader options here if needed
    loader.manager.onError = (url) => {
      console.log('Error loading FBX from URL:', url);
    };
  });

  // Process models to fix common issues
  useEffect(() => {
    models.forEach(model => {
      triangulateGeometry(model);
      limitSkinWeights(model);
    });
  }, [models]);

  // Extract all animation clips
  const clips = useMemo(() => {
    try {
      return models.flatMap((m) => m.animations || []);
    } catch (error) {
      console.log('Error extracting animation clips:', error);
      return [];
    }
  }, [models]);

  // Prepare mixer & actions
  const mixer = useRef<THREE.AnimationMixer>();
  const actions = useRef<THREE.AnimationAction[]>([]);

  // Initialize mixer and actions
  useEffect(() => {
    if (!models.length) return;
    
    try {
      const model = models[0];
      mixer.current = new THREE.AnimationMixer(model);
      
      if (clips.length > 0) {
        actions.current = clips.map((clip) =>
          mixer.current!.clipAction(clip).reset().stop()
        );
        
        // Play the first clip by default
        if (actions.current.length > 0) {
          actions.current[0].play();
        }
      }
      
      return () => {
        if (mixer.current) mixer.current.stopAllAction();
      };
    } catch (error) {
      console.log('Error initializing animation mixer:', error);
    }
  }, [models, clips]);

  // Switch to the requested clip when clipName changes
  useEffect(() => {
    if (!mixer.current || clips.length === 0 || !actions.current.length) return;
    
    try {
      // Stop all current actions
      actions.current.forEach((a) => a.stop());
      
      // Find the clip by name or use the first clip
      const selected = clips.find((c) => c.name === clipName) || clips[0];
      
      // Play the selected clip with crossfade
      const action = mixer.current.clipAction(selected);
      action.reset().fadeIn(0.5).play();
    } catch (error) {
      console.log('Error switching animation clip:', error);
    }
  }, [clipName, clips]);

  // Update animation mixer on each frame
  useFrame((_, delta) => {
    if (mixer.current) {
      try {
        mixer.current.update(delta);
      } catch (error) {
        console.log('Error updating animation mixer:', error);
      }
    }
  });

  // Render the model with error handling
  if (!models.length) {
    return null;
  }

  return (
    <primitive 
      object={models[0]} 
      dispose={null}
      scale={0.01}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

export default DollyAvatar;
