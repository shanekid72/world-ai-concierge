
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Zap, Cpu, Terminal, Shield } from 'lucide-react';

const DollyCyberpunkChat = () => {
  const [messages, setMessages] = useState<string[]>([
    "⚡ [SYSTEM BOOT] Neural core online. Welcome, user. How can I assist your digital transactions today? ⚡"
  ]);
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, `[USER] ${input}`, `[DOLLY] Processing request... standby for neural response...`]);
    setInput('');
  };

  return (
    <div className="grid grid-cols-12 h-screen bg-cyberpunk-bg tech-pattern scanlines text-cyan-400">
      {/* Sidebar */}
      <aside className="col-span-3 p-4 border-r border-fuchsia-900 bg-cyberpunk-dark/80 backdrop-blur-md">
        <div className="flex items-center space-x-2 mb-6">
          <Cpu className="h-6 w-6 text-cyberpunk-pink power-glow" />
          <h2 className="text-2xl font-cyber text-cyberpunk-pink neon-text">NEURAL_OS</h2>
        </div>
        
        <motion.div 
          className="mb-6 cyber-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-xs text-cyan-500 font-mono mb-1">// SYSTEM STATUS</div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Neural Core</span>
            <span className="text-cyberpunk-green">ONLINE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Security</span>
            <span className="text-cyberpunk-yellow">ELEVATED</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Connection</span>
            <span className="text-cyberpunk-blue">ENCRYPTED</span>
          </div>
        </motion.div>

        <div className="space-y-2">
          <div className="text-xs text-cyan-500 font-mono mb-2">// OPERATIONS</div>
          <motion.button 
            className="w-full py-2 px-3 flex items-center space-x-2 cyber-button rounded"
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(255,0,255,0.7)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="h-4 w-4" />
            <span>NEW TRANSFER</span>
          </motion.button>
          
          <motion.button 
            className="w-full py-2 px-3 flex items-center space-x-2 border border-cyan-700 bg-cyan-900/20 text-cyan-400 rounded"
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0,255,255,0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Terminal className="h-4 w-4" />
            <span>TRANSACTION LOGS</span>
          </motion.button>
          
          <motion.button 
            className="w-full py-2 px-3 flex items-center space-x-2 border border-cyberpunk-yellow/50 bg-cyberpunk-yellow/10 text-cyberpunk-yellow rounded"
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(255,204,0,0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield className="h-4 w-4" />
            <span>SECURITY PROTOCOL</span>
          </motion.button>
        </div>
      </aside>

      {/* Chat Frame */}
      <main className="col-span-9 flex flex-col p-4 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none bg-neon-glow opacity-50"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />

        <ScrollArea className="flex-1 z-10 cyber-grid rounded-xl p-4 border-cyan-800" ref={containerRef}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              className={`mb-4 font-mono text-md ${
                msg.includes("[USER]") 
                  ? "border-l-4 border-cyberpunk-blue pl-2" 
                  : "border-l-4 border-cyberpunk-pink pl-2"
              }`}
              initial={{ opacity: 0, x: msg.includes("[USER]") ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.includes("[USER]") ? (
                <div className="text-cyberpunk-blue">{msg}</div>
              ) : msg.includes("[DOLLY]") ? (
                <div className="text-cyberpunk-pink terminal-cursor">{msg}</div>
              ) : (
                <div className="text-cyan-400">{msg}</div>
              )}
            </motion.div>
          ))}
        </ScrollArea>

        <div className="flex z-10 gap-2 items-center mt-4">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 cyber-input h-12 rounded-md"
            placeholder="Enter command sequence..."
          />
          <Button 
            onClick={sendMessage} 
            className="cyber-button h-12 w-12 rounded-md"
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DollyCyberpunkChat;
