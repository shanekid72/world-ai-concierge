import React from 'react'

interface ChatMessageProps {
  message: string
  isAI?: boolean
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAI = false }) => {
  return (
    <div className={`p-4 rounded-lg ${isAI ? 'bg-cyan-900/30' : 'bg-fuchsia-900/30'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center ${
          isAI ? 'bg-cyan-500/20 text-cyan-400' : 'bg-fuchsia-500/20 text-fuchsia-400'
        }`}>
          {isAI ? 'AI' : 'U'}
        </div>
        <div className="flex-1">
          <p className="cyber-text">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage 