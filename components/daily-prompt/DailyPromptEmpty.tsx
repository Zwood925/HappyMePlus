import React from 'react';
import { motion } from 'framer-motion';

export default function DailyPromptEmpty() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 shadow-sm border border-blue-100"
    >
      <div className="text-center">
        <div className="text-2xl mb-2">🌟</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No prompt today</h3>
        <p className="text-gray-600">Check back tomorrow for a new daily prompt!</p>
      </div>
    </motion.div>
  );
}
