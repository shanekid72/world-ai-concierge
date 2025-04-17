import React, { useState } from 'react';
import Header from '@/components/Header';
import { SidebarNavigation } from '@/components/SidebarNavigation';
import { onboardingStages } from '@/components/OnboardingStages';
import QuoteHandler from '@/components/transaction/QuoteHandler';
import TransactionHandler from '@/components/transaction/TransactionHandler';
import ChatInterface from '@/components/ChatInterface';
import { useWorldApiChat } from '@/hooks/useWorldApiChat';

const Index: React.FC = () => {
  const { stage, setStage } = useWorldApiChat();

  const [completedStages, setCompletedStages] = useState<string[]>(['intro']); // starter

  const renderModule = () => {
    switch (stage) {
      case 'go-live':
        return (
          <div className="space-y-6">
            <QuoteHandler />
            <TransactionHandler />
          </div>
        );
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0c29] text-white">
      <Header />
      <div className="flex flex-1">
        <SidebarNavigation
          currentStage={stage}
          completedStages={completedStages}
          onNavigate={(nextStage) => setStage(nextStage)}
        />
        <main className="flex-1 p-6">{renderModule()}</main>
      </div>
    </div>
  );
};

export default Index;
