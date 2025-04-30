import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LipSyncProps {
  audioStream?: MediaStream;
  isSpeaking: boolean;
  emotion?: 'neutral' | 'happy' | 'angry' | 'surprised';
}

const MOUTH_SHAPES = {
  neutral: 'M 20,50 Q 50,30 80,50 Q 50,70 20,50',
  happy: 'M 20,50 Q 50,20 80,50 Q 50,80 20,50',
  angry: 'M 20,50 Q 50,40 80,50 Q 50,60 20,50',
  surprised: 'M 20,50 Q 50,10 80,50 Q 50,90 20,50'
};

export const LipSync: React.FC<LipSyncProps> = ({ 
  audioStream, 
  isSpeaking,
  emotion = 'neutral'
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const [mouthOpenness, setMouthOpenness] = React.useState(0);
  const [mouthShape, setMouthShape] = React.useState(MOUTH_SHAPES[emotion]);

  useEffect(() => {
    if (!audioStream || !isSpeaking) {
      setMouthOpenness(0);
      return;
    }

    // Initialize audio context and analyser
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(audioStream);
    source.connect(analyserRef.current);

    // Configure analyser for better frequency analysis
    analyserRef.current.fftSize = 512;
    analyserRef.current.smoothingTimeConstant = 0.8;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Animation loop with enhanced analysis
    const updateMouthPosition = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Analyze different frequency bands
      const lowFreq = dataArray.slice(0, bufferLength / 4).reduce((a, b) => a + b) / (bufferLength / 4);
      const midFreq = dataArray.slice(bufferLength / 4, bufferLength / 2).reduce((a, b) => a + b) / (bufferLength / 4);
      const highFreq = dataArray.slice(bufferLength / 2).reduce((a, b) => a + b) / (bufferLength / 2);
      
      // Weighted average for more natural movement
      const openness = Math.min(
        (lowFreq * 0.4 + midFreq * 0.4 + highFreq * 0.2) / 128,
        1
      );
      
      setMouthOpenness(openness);

      animationFrameRef.current = requestAnimationFrame(updateMouthPosition);
    };

    updateMouthPosition();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream, isSpeaking]);

  useEffect(() => {
    setMouthShape(MOUTH_SHAPES[emotion]);
  }, [emotion]);

  return (
    <motion.div
      className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
      style={{ width: '100px', height: '100px' }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{
          d: mouthShape,
          scaleY: isSpeaking ? [1, 1 + mouthOpenness * 0.5, 1] : 1,
          transition: {
            duration: 0.1,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: "reverse"
          }
        }}
      >
        <motion.path
          d={mouthShape}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-cyber-accent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
    </motion.div>
  );
}; 