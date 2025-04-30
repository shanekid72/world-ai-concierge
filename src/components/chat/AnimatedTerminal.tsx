
import React, { useEffect, useState } from 'react';

const lines = [
  '💻 [> Initializing encrypted comms channel...]',
  '☠️ [> Patching through proxies… rerouting through shadow relays…]',
  '🧠 [> Injecting behavioral data into AI core: "Dolly"]',
  '🔐 [> Handshake with MCP node accepted]',
  '🌒 [> Signal reflected off 3 satellite hops... traced & obfuscated]',
  '📡 [> Locking on to WorldAPI quantum grid…]',
  '💥 [> Brute-punching firewalls at WU… ✅]',
  '🏦 [> Ghosting into Federal Bank backbone… ✅]',
  '💳 [> Piggybacking on payment channels… ✅]',
  '⛓️ [> Blockchain nodes whispering: "It has begun."]',
  '🕵️‍♂️ [> Negotiating trust keys with: Digit9, LuLu, unknown partners… ✅]',
  '🧩 [> Aligning integration channels…]',
  '🎯 [> All systems green. Execution imminent.]',
];

const AnimatedTerminal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedLines((prev) => [...prev, lines[i]]);
      i++;
      if (i === lines.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowTerminal(false);
          onComplete();
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!showTerminal) return null;

  return (
    <div className="bg-black text-green-400 font-mono p-4 rounded-lg shadow-lg animate-fade-in text-sm">
      {displayedLines.map((line, idx) => (
        <div key={idx} className="glitch whitespace-pre-wrap">{line}</div>
      ))}
    </div>
  );
};

export default AnimatedTerminal;
