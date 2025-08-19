import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getWorldBoardResponses, DailyPromptResponse } from '../lib/dailyPrompts';
import { sendEncouragementNotification } from '../lib/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function WorldBoard() {
  const { user } = useFirebaseAuth();
  const [responses, setResponses] = useState<DailyPromptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEncouragement, setSendingEncouragement] = useState<string | null>(null);

  useEffect(() => {
    loadWorldBoardResponses();
  }, []);

  const loadWorldBoardResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      const worldResponses = await getWorldBoardResponses(50);
      setResponses(worldResponses);
    } catch (error) {
      console.error('Error loading world board responses:', error);
      setError('Failed to load joy from around the world');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEncouragement = async (response: DailyPromptResponse) => {
    if (!user?.uid || sendingEncouragement) return;

    try {
      setSendingEncouragement(response.id);
      
      // Send encouragement notification
      await sendEncouragementNotification(
        response.userId,
        user.displayName || 'Someone from the World Board',
        '💝 Someone from around the world loved your joy and sent you encouragement!',
        undefined
      );

      // Show success feedback
      // You could add a toast notification here
      
    } catch (error) {
      console.error('Error sending encouragement:', error);
    } finally {
      setSendingEncouragement(null);
    }
  };

  const getRandomEmoji = () => {
    const emojis = ['🌟', '✨', '💫', '⭐', '🎉', '🎊', '💖', '💝', '💕', '💗', '💓', '💞'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Just now';
    
    const now = new Date();
    const responseTime = timestamp.toDate();
    const diffInMinutes = Math.floor((now.getTime() - responseTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🌍</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">World Board</h1>
                <p className="text-gray-600">Joy from around the world</p>
              </div>
            </div>
            <Link href="/">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <span className="text-2xl">←</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">{responses.length}</div>
              <div className="text-gray-600">Joy shared today</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">🌍</div>
              <div className="text-gray-600">Around the world</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">✨</div>
              <div className="text-gray-600">Spreading joy</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading joy from around the world...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadWorldBoardResponses}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* World Board Responses */}
        {!loading && !error && (
          <div className="space-y-6">
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Be the first to share joy!</h3>
                <p className="text-gray-600 mb-6">Share your daily prompt response publicly to appear on the World Board</p>
                <Link href="/">
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                    Share Your Joy
                  </button>
                </Link>
              </div>
            ) : (
              <AnimatePresence>
                {responses.map((response, index) => (
                  <motion.div
                    key={response.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {/* Prompt */}
                    <div className="mb-4">
                      <div className="text-sm text-purple-600 font-medium mb-2">
                        Today's Prompt
                      </div>
                      <div className="text-lg text-gray-800 font-medium italic">
                        "{response.promptText}"
                      </div>
                    </div>

                    {/* Response */}
                    <div className="mb-4">
                      <div className="text-gray-700 leading-relaxed text-lg">
                        {response.response}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getRandomEmoji()}</div>
                        <div className="text-sm text-gray-500">
                          {getTimeAgo(response.createdAt)}
                        </div>
                      </div>

                      {user && user.uid !== response.userId && (
                        <button
                          onClick={() => handleSendEncouragement(response)}
                          disabled={sendingEncouragement === response.id}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {sendingEncouragement === response.id ? (
                            <span className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </span>
                          ) : (
                            'Send Encouragement 💝'
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Call to Action */}
        {!loading && !error && responses.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Share your joy with the world!</h3>
              <p className="text-gray-600 mb-6">
                Your daily prompt response could inspire someone across the globe
              </p>
              <Link href="/">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                  Share Your Joy
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
