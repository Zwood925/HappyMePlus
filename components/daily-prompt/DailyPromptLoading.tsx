import React from 'react';
import { motion } from 'framer-motion';

export default function DailyPromptLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 shadow-sm border border-yellow-100"
    >
      <div className="animate-pulse">
        <div className="h-4 bg-yellow-200 rounded w-3/4 mb-3"></div>
        <div className="h-6 bg-yellow-200 rounded w-1/2"></div>
      </div>
    </motion.div>
  );
}
