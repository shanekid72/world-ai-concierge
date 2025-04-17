import React, { useState } from "react";
import DollyBootup from "@/components/DollyBootup";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [booted, setBooted] = useState(false);

  return booted ? <ChatInterface /> : <DollyBootup onComplete={() => setBooted(true)} />;
};

export default Index;
