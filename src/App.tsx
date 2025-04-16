import React from 'react';
import DollyEpicBoot from './components/DollyEpicBoot';
import DollyCyberpunkChat from './components/DollyCyberpunkChat';
import { useWorldApiChat } from './hooks/useWorldApiChat';

function App() {
  const { stage, setStage } = useWorldApiChat();

  if (stage === 'dollyEpicBoot') {
    return <DollyEpicBoot onBootComplete={() => setStage('choosePath')} />;
  }

  return <DollyCyberpunkChat />;
}

export default App;
