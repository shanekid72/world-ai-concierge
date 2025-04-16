import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const DollyCyberpunkChat = () => {
  const [messages, setMessages] = useState<string[]>([
    "⚡ Hey there, neon soul! Ready to move some money through the matrix? 💫"
  ]);
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, `🧠 You: ${input}`, `🤖 Dolly: Working my neon magic on that... 💥`]);
    setInput('');
  };

  return (
    <div className="grid grid-cols-12 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Sidebar */}
      <aside className="col-span-3 p-4 border-r border-fuchsia-500 bg-[#1b1b2f]/60">
        <h2 className="text-2xl font-bold text-fuchsia-400 mb-4">⚙️ Dolly Settings</h2>
        <ul className="space-y-2">
          <li className="hover:text-fuchsia-300 cursor-pointer">💸 New Transfer</li>
          <li className="hover:text-fuchsia-300 cursor-pointer">📜 Transaction History</li>
          <li className="hover:text-fuchsia-300 cursor-pointer">🧠 Personality Mode</li>
        </ul>
      </aside>

      {/* Chat Frame */}
      <main className="col-span-9 flex flex-col p-4 space-y-4 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 opacity-30 pointer-events-none"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 8 }}
          style={{ background: 'radial-gradient(circle, #ff00cc, #333399)' }}
        />

        <ScrollArea className="flex-1 z-10 backdrop-blur-md bg-black/30 rounded-xl p-4 border border-fuchsia-600" ref={containerRef}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              className="mb-2 text-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {msg}
            </motion.div>
          ))}
        </ScrollArea>

        <div className="flex z-10 gap-2 items-center">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-black/40 border-fuchsia-600 text-white placeholder-fuchsia-300"
            placeholder="Type in neon and hit Enter ⚡"
          />
          <Button onClick={sendMessage} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DollyCyberpunkChat;
