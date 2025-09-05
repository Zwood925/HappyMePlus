import React from 'react';

const JOY_PROMPTS = [
  "What made you smile today? 😊",
  "Share a moment of gratitude 🌱",
  "What's bringing you joy right now? ✨",
  "Tell us about a kind act you witnessed or did 💫"
];

interface JoyPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export default function JoyPrompts({ onPromptSelect }: JoyPromptsProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Need inspiration? 💡
      </label>
      <div className="grid grid-cols-1 gap-2">
        {JOY_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptSelect(prompt)}
            className="text-left p-2 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
