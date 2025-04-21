import React, { useState, useEffect } from 'react'
import { DollyAvatar } from './components/avatar/DollyAvatar'
import DollyBootup from './components/DollyBootup'
import { ChatInterface } from './components/ChatInterface'
import Header from './components/Header'
import SidebarNavigation from './components/SidebarNavigation'
import { LoadingScreen } from './components/LoadingScreen'

function App() {
  const [isBooted, setIsBooted] = useState(false)
  const [currentStep, setCurrentStep] = useState('welcome')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Array<{ text: string; isAI: boolean }>>([
    { text: "Welcome to World AI Concierge! How can I assist you today?", isAI: true }
  ])

  useEffect(() => {
    // Remove the initial loader
    const initialLoader = document.querySelector('.initial-loader');
    if (initialLoader) {
      initialLoader.remove();
    }

    // Initialize app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { text: message, isAI: false }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I'm processing your request. How can I help you further?", 
        isAI: true 
      }]);
    }, 1000);
  };

  const handleMessage = (message: string) => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { text: message, isAI: true }]);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-screen bg-cyber-dark text-white overflow-hidden">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 p-4 border-r border-cyber-blue/20">
          <SidebarNavigation 
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full container mx-auto px-4 py-8 relative">
            <div className="h-full max-w-4xl mx-auto">
              <div className="relative mb-8">
                <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-20">
                  <DollyAvatar 
                    isSpeaking={isSpeaking}
                    expression={isListening ? 'happy' : 'neutral'}
                    gesture={isSpeaking ? 'explaining' : 'idle'}
                    position={{ x: 50, y: 0 }}
                  />
                </div>
              </div>
              
              <div className="mt-12 h-[calc(100%-6rem)]">
                {!isBooted ? (
                  <DollyBootup onComplete={() => setIsBooted(true)} />
                ) : (
                  <ChatInterface 
                    onStartListening={() => setIsListening(true)}
                    onStopListening={() => setIsListening(false)}
                    onStartSpeaking={() => setIsSpeaking(true)}
                    onStopSpeaking={() => setIsSpeaking(false)}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onMessage={handleMessage}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App
