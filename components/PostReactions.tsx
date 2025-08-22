import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface PostReactionsProps {
  postId: string;
  initialReactions?: Reaction[];
  onReaction?: (emoji: string) => void;
  className?: string;
}

const REACTION_OPTIONS = [
  { emoji: '💖', label: 'Love' },
  { emoji: '🤗', label: 'Hug' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '✨', label: 'Sparkle' },
  { emoji: '🌱', label: 'Grow' },
  { emoji: '💫', label: 'Magic' }
];

export default function PostReactions({ 
  postId, 
  initialReactions = [], 
  onReaction,
  className = '' 
}: PostReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>(
    initialReactions.length > 0 
      ? initialReactions 
      : REACTION_OPTIONS.map(option => ({
          emoji: option.emoji,
          count: 0,
          hasReacted: false
        }))
  );
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    setReactions(prev => 
      prev.map(reaction => 
        reaction.emoji === emoji 
          ? {
              ...reaction,
              count: reaction.hasReacted ? reaction.count - 1 : reaction.count + 1,
              hasReacted: !reaction.hasReacted
            }
          : reaction
      )
    );
    
    onReaction?.(emoji);
    setShowReactionPicker(false);
  };

  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Active Reactions Display */}
      {activeReactions.length > 0 && (
        <div className="flex items-center space-x-1">
          {activeReactions.map((reaction) => (
            <motion.button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className={`px-2 py-1 rounded-full text-sm transition-all ${
                reaction.hasReacted 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-1">{reaction.emoji}</span>
              <span className="text-xs font-medium">{reaction.count}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Reaction Picker */}
      <div className="relative">
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
        >
          <span className="text-lg">💭</span>
        </button>

        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10"
            >
              <div className="grid grid-cols-3 gap-1">
                {REACTION_OPTIONS.map((option) => (
                  <motion.button
                    key={option.emoji}
                    onClick={() => handleReaction(option.emoji)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={option.label}
                  >
                    <span className="text-xl">{option.emoji}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
