import React from 'react'

const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-4">
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 200}ms`,
              boxShadow: '0 0 10px #0ff'
            }}
          />
        ))}
      </div>
      <span className="text-cyan-400 text-sm">Processing</span>
    </div>
  )
}

export default LoadingAnimation 