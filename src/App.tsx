import { useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card } from './components/ui/card'
import ChatMessage from './components/ChatMessage'
import LoadingAnimation from './components/LoadingAnimation'

interface Message {
  text: string
  isAI: boolean
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (input.trim()) {
      // Add user message
      const userMessage: Message = { text: input, isAI: false }
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          text: "I'm your cybernetic assistant. How can I help you navigate the digital realm?",
          isAI: true
        }
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen cyber-grid-bg p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold cyber-heading glitch-text mb-2">
            World AI Concierge
          </h1>
          <p className="text-xl cyber-text">
            Your cybernetic guide to the digital realm
          </p>
        </header>

        <Card className="cyber-card mb-6">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg.text} isAI={msg.isAI} />
            ))}
            {isLoading && <LoadingAnimation />}
          </div>
        </Card>

        <div className="flex gap-2">
          <Input
            className="cyber-input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            className="cyber-button" 
            onClick={handleSend}
            disabled={isLoading}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
