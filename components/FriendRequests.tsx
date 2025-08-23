import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest, FriendRequest, UserProfile } from '../lib/community';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface FriendRequestsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendRequests({ isOpen, onClose }: FriendRequestsProps) {
  const { user } = useFirebaseAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadFriendRequests();
    }
  }, [isOpen, user?.uid]);

  const loadFriendRequests = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError('');

    try {
      const friendRequests = await getFriendRequests(user.uid);
      setRequests(friendRequests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      setError('Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setError('Failed to reject friend request');
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
                <h2 className="text-xl font-semibold text-gray-800">Friend Requests</h2>
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
                  <p className="text-gray-500">Loading friend requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-3">👥</div>
                  <p>No friend requests</p>
                  <p className="text-sm">When someone sends you a friend request, it will appear here</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {requests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.fromUser?.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {request.fromUser?.displayName || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{request.fromUser?.username || 'unknown'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAccept(request.id!)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request.id!)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Accept friend requests to connect and share joy together! ✨
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
