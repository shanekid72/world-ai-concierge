
import React from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-white to-gray-50">
        <ChatInterface />
      </main>
    </div>
  );
};

export default Index;
