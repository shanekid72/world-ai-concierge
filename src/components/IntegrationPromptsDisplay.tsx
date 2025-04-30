import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface IntegrationPromptsDisplayProps {
  prompts: string[];
}

const IntegrationPromptsDisplay: React.FC<IntegrationPromptsDisplayProps> = ({ prompts }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000); // Reset icon after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        // Optionally show an error message to the user
      });
  };

  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-cyber-darker/60 border border-cyber-accent/30 rounded shadow-lg backdrop-blur-sm">
      <h4 className="text-sm font-semibold text-cyber-accent mb-3">Integration Prompts:</h4>
      <ul className="space-y-3">
        {prompts.map((prompt, index) => (
          <li key={index} className="flex items-start justify-between gap-3 p-2 rounded bg-cyber-dark/50 border border-cyber-border/20">
            <pre className="text-xs text-cyber-body font-mono whitespace-pre-wrap flex-1">
              {/* Basic markdown-like formatting - treat as code block */}
              {prompt}
            </pre>
            <button
              onClick={() => handleCopy(prompt, index)}
              className="p-1 text-cyber-accent hover:text-cyber-heading transition-colors duration-200 flex-shrink-0"
              title="Copy prompt"
            >
              {copiedIndex === index ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IntegrationPromptsDisplay; 