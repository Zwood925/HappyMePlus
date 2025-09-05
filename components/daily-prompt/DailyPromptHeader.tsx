import React from 'react';

interface DailyPromptHeaderProps {
  promptText: string;
}

export default function DailyPromptHeader({ promptText }: DailyPromptHeaderProps) {
  return (
    <>
      {/* Prompt Header */}
      <div className="flex items-center mb-4">
        <div className="text-3xl mr-3">✨</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daily Joy Prompt</h3>
          <p className="text-sm text-gray-600">Share what brings you joy today</p>
        </div>
      </div>

      {/* Prompt Text */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-lg text-gray-800 font-medium leading-relaxed">
          &ldquo;{promptText}&rdquo;
        </p>
      </div>
    </>
  );
}
