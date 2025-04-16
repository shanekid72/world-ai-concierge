import React, { useEffect, useState } from 'react';
import DollyCyberpunkChat from './components/DollyCyberpunkChat';
import DollyBootup from './components/DollyBootup';

function App() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-screen">
      {booted ? (
        <DollyCyberpunkChat />
      ) : (
        <DollyBootup />
      )}

      {/* Dolly Floating Avatar */}
      {booted && (
        <div className="absolute top-6 right-6 z-50">
          <div className="relative animate-pulse hover:animate-none">
            <img
              src="/dolly-avatar.png"
              alt="Dolly Avatar"
              className="w-20 h-20 rounded-full border-4 border-fuchsia-500 shadow-lg shadow-fuchsia-700 animate-bounce hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-black rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
