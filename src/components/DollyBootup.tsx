import { motion } from "framer-motion";

const DollyBootup = () => {
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center text-cyberpunk-pink font-mono"
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
          className="text-lg text-cyberpunk-purple"
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
