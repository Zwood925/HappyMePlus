import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFriends, UserProfile } from '../lib/community';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface FriendsListProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendSelected?: (friend: UserProfile) => void;
}

export default function FriendsList({ isOpen, onClose, onFriendSelected }: FriendsListProps) {
  const { user } = useFirebaseAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadFriends();
    }
  }, [isOpen, user?.uid]);

  const loadFriends = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError('');

    try {
      const friendsList = await getFriends(user.uid);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
      setError('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendClick = (friend: UserProfile) => {
    if (onFriendSelected) {
      onFriendSelected(friend);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Friends</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-3">👥</div>
                  <p>No friends yet</p>
                  <p className="text-sm">Start connecting with people to see them here!</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {friends.map((friend) => (
                    <motion.div
                      key={friend.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleFriendClick(friend)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {friend.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{friend.displayName}</p>
                          <p className="text-sm text-gray-500">@{friend.username}</p>
                        </div>
                      </div>
                      
                      <div className="ml-auto">
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Friend
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Your friends will appear here once you connect! ✨
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
