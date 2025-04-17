import React from 'react';
import { motion } from 'framer-motion';

const DollyAvatar = () => {
  return (
    <motion.div
      className="w-24 h-24 rounded-full border-4 border-fuchsia-500 overflow-hidden shadow-xl bg-black"
      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      <img
        src="/lovable-uploads/dolly-avatar.png"
        alt="Dolly"
        className="object-cover w-full h-full"
      />
    </motion.div>
  );
};

export default DollyAvatar;
