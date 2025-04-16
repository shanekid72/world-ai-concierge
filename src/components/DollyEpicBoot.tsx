import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const bootLines = [
  '🔌 Connecting to worldAPI MCP core...',
  '🧠 Loading global partner neural graph...',
  '📡 Syncing 247 financial endpoints...',
  '✅ Western Union link established',
  '✅ Federal Bank linked',
  '✅ Wallet Mesh connected',
  '🚀 Optimizing integration modules...',
  '💾 Transmitting credentials...',
  '🛰️ Handshaking with FX rate oracle...',
  '✨ Establishing encrypted transaction tunnels...',
  '📦 Deploying sandbox simulators...',
  '⏳ Finalizing...'
];

const DollyEpicBoot = ({ onBootComplete }: { onBootComplete: () => void }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < bootLines.length) {
      const timeout = setTimeout(() => setStep(step + 1), 3000);
      return () => clearTimeout(timeout);
    } else {
      const finalTimeout = setTimeout(() => {
        onBootComplete();
      }, 3000);
      return () => clearTimeout(finalTimeout);
    }
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-fuchsia-300 font-mono text-lg tracking-widest p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center max-w-xl"
      >
        <h2 className="text-3xl mb-8 text-fuchsia-500 font-bold">👾 Dolly Booting Up...</h2>

        {bootLines.slice(0, step).map((line, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="mb-2"
          >
            {line}
          </motion.p>
        ))}

        {step >= 5 && step <= 6 && (
          <motion.p
            className="text-green-300 mt-6 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            👀 Wait... are you the CFO? I was literally born for this.
          </motion.p>
        )}

        {step === bootLines.length && (
          <motion.h3
            className="text-xl text-white mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            ✅ Connection Complete. Welcome to the neon future.
          </motion.h3>
        )}
      </motion.div>
    </div>
  );
};

export default DollyEpicBoot;
