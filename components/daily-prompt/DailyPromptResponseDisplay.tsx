import React from 'react';
import { motion } from 'framer-motion';
import { DailyPromptResponse } from '../../lib/dailyPrompts';

interface DailyPromptResponseDisplayProps {
  response: DailyPromptResponse;
  onCreateJoyCard: () => void;
}

export default function DailyPromptResponseDisplay({ 
  response, 
  onCreateJoyCard 
}: DailyPromptResponseDisplayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-white rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center mb-2">
        <div className="text-green-500 mr-2">✅</div>
        <span className="text-sm font-medium text-gray-700">Your response today:</span>
      </div>
      <p className="text-gray-800 leading-relaxed">{response.response}</p>
      <div className="flex items-center justify-between mt-3">
        {response.isPublic && (
          <div className="text-xs text-blue-600 flex items-center">
            <span className="mr-1">🌍</span>
            Shared on World Board
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateJoyCard}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          ✨ Create Joy Card
        </motion.button>
      </div>
    </motion.div>
  );
}
