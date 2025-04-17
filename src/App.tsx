import { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import DollyBootup from "@/components/DollyBootup";

const App = () => {
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowBoot(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  return showBoot ? <DollyBootup /> : <ChatInterface />;
};

export default App;
