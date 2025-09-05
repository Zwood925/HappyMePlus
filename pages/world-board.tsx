import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getWorldBoardResponses, DailyPromptResponse } from '../lib/dailyPrompts';
import { sendEncouragementNotification } from '../lib/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavigation from '../components/BottomNavigation';

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
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌍</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">World Board</h1>
              <p className="text-xs text-gray-500">Joy from around the world</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
        {/* Stats */}
        <div className="bg-white m-4 rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{responses.length}</div>
            <div className="text-sm text-gray-600">Moments of joy shared today</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loading loading-spinner loading-lg text-purple-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">😔</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadWorldBoardResponses}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No joy shared yet</h3>
              <p className="text-gray-500">Be the first to share joy with the world!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {getRandomEmoji()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-2">
                        {getTimeAgo(response.createdAt)}
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-purple-700 font-medium mb-1">
                          &ldquo;{response.promptText}&rdquo;
                        </p>
                        <p className="text-gray-800">{response.response}</p>
                      </div>
                      <button
                        onClick={() => handleSendEncouragement(response)}
                        disabled={sendingEncouragement === response.id}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                      >
                        {sendingEncouragement === response.id ? (
                          <span className="flex items-center">
                            <div className="loading loading-spinner loading-xs mr-1"></div>
                            Sending...
                          </span>
                        ) : (
                          '💝 Send Encouragement'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}
