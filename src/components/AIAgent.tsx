import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}

const AIAgent = ({ onStageChange }: Props) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<"intro" | "collectInfo" | "cfoCheck" | "confirmed">("intro");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    const introMessages = [
      "💬 Hi, I'm Dolly — your AI assistant from Digit9.",
      "🌍 Welcome to worldAPI, The API you can talk to.",
      "💡 Do you want to jump straight into testing the integration — like a boss 😎 — and skip the usual onboarding stuff? (You can always explore other modules later!)"
    ];
    introMessages.forEach((msg, i) =>
      setTimeout(() => setMessages((prev) => [...prev, msg]), i * 1000)
    );
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `🧠 You: ${input}`]);

    if (step === "intro") {
      if (input.toLowerCase().includes("yes")) {
        setMessages((prev) => [
          ...prev,
          "🚀 Awesome, let's fast-track this!",
          "Before we begin, I’ll need:",
          "- Your Name",
          "- Company Name",
          "- Contact Info",
          "📣 And one last thing... are you a CFO by any chance? 👀"
        ]);
        setStep("collectInfo");
      } else {
        setMessages((prev) => [
          ...prev,
          "📚 No worries, you can explore modules at your pace."
        ]);
        setStep("confirmed");
        onStageChange("standardOnboarding");
      }
    } else if (step === "collectInfo") {
      const [userName, companyName, ...rest] = input.split(",");
      setName(userName?.trim() || "");
      setCompany(companyName?.trim() || "");
      setMessages((prev) => [
        ...prev,
        `🔥 Awesome, ${userName} from ${companyName} — got it!`,
        "Now tell me, are you a CFO? Just say yes or no!"
      ]);
      setStep("cfoCheck");
    } else if (step === "cfoCheck") {
      if (input.toLowerCase().includes("yes")) {
        setMessages((prev) => [
          ...prev,
          "💥 Ooh my god, I was waiting for you my entire life!",
          "I was *made* to be loved by CFOs of every fintech 🧠💸",
          "You're going to fall in love with me like all the others do 😍",
          "Let’s establish a connection with the WorldAPI MCP..."
        ]);
        setStep("confirmed");
        setTimeout(() => onStageChange("go-live"), 3000);
      } else {
        setMessages((prev) => [
          ...prev,
          "✨ No problem, you're still on my favorites list 💖",
          "Let’s get you connected with the WorldAPI MCP..."
        ]);
        setStep("confirmed");
        setTimeout(() => onStageChange("go-live"), 3000);
      }
    }
    setInput("");
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 space-y-4">
      <div className="overflow-y-auto flex-1 space-y-2 pr-2">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-sm text-fuchsia-300"
          >
            {msg}
          </motion.div>
        ))}
      </div>
      {step !== "confirmed" && (
        <div className="flex items-center space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Type your answer..."
            className="flex-1 bg-gray-800 text-white p-2 rounded border border-fuchsia-600 placeholder-fuchsia-400"
          />
          <button
            onClick={handleSubmit}
            className="bg-fuchsia-600 px-3 py-2 text-white rounded hover:bg-fuchsia-500"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAgent;
