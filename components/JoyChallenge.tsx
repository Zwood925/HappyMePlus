import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  participants: number;
  isActive: boolean;
  endDate: Date;
  category: 'daily' | 'weekly' | 'community';
}

interface JoyChallengeProps {
  challenge: Challenge;
  onParticipate?: (challengeId: string) => void;
  hasParticipated?: boolean;
  className?: string;
}

const CHALLENGE_CATEGORIES = {
  daily: { color: 'bg-green-100 text-green-700', label: 'Daily' },
  weekly: { color: 'bg-blue-100 text-blue-700', label: 'Weekly' },
  community: { color: 'bg-purple-100 text-purple-700', label: 'Community' }
};

export default function JoyChallenge({ 
  challenge, 
  onParticipate,
  hasParticipated = false,
  className = '' 
}: JoyChallengeProps) {
  const { user } = useFirebaseAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleParticipate = () => {
    if (!user || hasParticipated) return;
    onParticipate?.(challenge.id);
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  const category = CHALLENGE_CATEGORIES[challenge.category];

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Challenge Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-3xl">{challenge.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                  {category.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>👥 {challenge.participants} participating</span>
                <span>{getTimeRemaining()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {isExpanded ? 'Show less' : 'Learn more'}
          </button>
          
          {user && !hasParticipated && challenge.isActive && (
            <button
              onClick={handleParticipate}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Join Challenge ✨
            </button>
          )}
          
          {hasParticipated && (
            <div className="flex items-center space-x-2 text-green-600">
              <span className="text-lg">✅</span>
              <span className="text-sm font-medium">Participated!</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 border-t border-gray-100"
        >
          <div className="pt-3 space-y-3">
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-purple-800 mb-1">How to participate:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Share your joy related to this challenge</li>
                <li>• Use the challenge hashtag in your post</li>
                <li>• Encourage others to join too!</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="font-medium text-yellow-800 mb-1">Rewards:</h4>
              <p className="text-sm text-yellow-700">
                Complete challenges to earn joy points and unlock special badges! 🌟
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
