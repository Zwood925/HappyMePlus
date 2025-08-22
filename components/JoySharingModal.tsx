import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface JoySharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: { content: string; isPublic: boolean }) => void;
}

const JOY_PROMPTS = [
  "What made you smile today? 😊",
  "Share a moment of gratitude 🌱",
  "What's bringing you joy right now? ✨",
  "Tell us about a kind act you witnessed or did 💫"
];

export default function JoySharingModal({
  isOpen,
  onClose,
  onShare
}: JoySharingModalProps) {
  const { user } = useFirebaseAuth();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!content.trim() || !user) return;

    setIsSharing(true);
    try {
      await onShare({
        content: content.trim(),
        isPublic
      });
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error sharing joy:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🌟</div>
                  <h2 className="text-lg font-bold text-gray-800">Share Your Joy</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Joy Prompts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Need inspiration? 💡
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {JOY_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setContent(prompt)}
                      className="text-left p-2 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Joy Moment ✨
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what's bringing you joy today..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  maxLength={500}
                />
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Share with community</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={!content.trim() || isSharing}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSharing ? 'Sharing...' : 'Share Joy ✨'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
