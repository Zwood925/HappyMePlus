import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchUsersByUsername, sendFriendRequest, UserProfile } from '../lib/community';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface UserSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelected?: (user: UserProfile) => void;
}

export default function UserSearch({ isOpen, onClose, onUserSelected }: UserSearchProps) {
  const { user } = useFirebaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError('');

      try {
        const results = await searchUsersByUsername(searchQuery);
        // Filter out current user
        const filteredResults = results.filter((u: UserProfile) => u.uid !== user?.uid);
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        setError('Failed to search users');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user?.uid]);

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user?.uid) return;

    try {
      await sendFriendRequest(user.uid, targetUserId);
      setFriendRequests(prev => new Set(prev).add(targetUserId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request');
    }
  };

  const handleUserClick = (userProfile: UserProfile) => {
    if (onUserSelected) {
      onUserSelected(userProfile);
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
                <h2 className="text-xl font-semibold text-gray-800">Find Friends</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">@</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                  placeholder="Search by username..."
                  className="w-full p-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {searchQuery.length < 2 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-3">🔍</div>
                  <p>Type at least 2 characters to search</p>
                </div>
              ) : searchResults.length === 0 && !isSearching ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-3">👥</div>
                  <p>No users found</p>
                  <p className="text-sm">Try a different username</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {searchResults.map((userProfile) => (
                    <motion.div
                      key={userProfile.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(userProfile)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {userProfile.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{userProfile.displayName}</p>
                          <p className="text-sm text-gray-500">@{userProfile.username}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendFriendRequest(userProfile.uid);
                        }}
                        disabled={friendRequests.has(userProfile.uid)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          friendRequests.has(userProfile.uid)
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                      >
                        {friendRequests.has(userProfile.uid) ? 'Sent ✓' : 'Add Friend'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Search for friends by their username to connect and share joy together! ✨
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
