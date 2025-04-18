import { motion } from 'framer-motion';

export function DollyAvatar() {
  return (
    <motion.div
      className="relative w-16 h-16"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-cyberpunk-pink/20 blur-xl rounded-full" />
      <img
        src="/dolly-cyberpunk.png"
        alt="Dolly Avatar"
        className="relative w-full h-full object-cover rounded-full border-2 border-cyberpunk-pink"
      />
    </motion.div>
  );
} 