import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: () => void;
}

const DollyBootup = ({ onComplete }: Props) => {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 45000); // 45 sec animation
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center text-fuchsia-400 font-mono"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.h1
          className="text-4xl mb-4"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          ⚡ Initializing Dolly Neural Core...
        </motion.h1>

        <motion.p
          className="text-lg text-fuchsia-200"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          syncing memory nodes • aligning sarcasm modules • boosting attitude...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default DollyBootup;
