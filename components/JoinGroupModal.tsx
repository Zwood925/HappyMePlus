import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { joinGroupByCode, getGroupByCode, Group } from '../lib/community';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (groupId: string) => void;
}

export default function JoinGroupModal({ isOpen, onClose, onJoinSuccess }: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCodeChange = async (code: string) => {
    setInviteCode(code.toUpperCase());
    setError('');
    setGroup(null);

    if (code.length === 6) {
      setLoading(true);
      try {
        const foundGroup = await getGroupByCode(code.toUpperCase());
        if (foundGroup) {
          setGroup(foundGroup);
        } else {
          setError('Invalid invite code');
        }
      } catch (error) {
        setError('Error checking invite code');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleJoinGroup = async () => {
    if (!group) return;

    setLoading(true);
    try {
      // This would need the current user's ID - you'd pass it as a prop or get it from auth
      const userId = 'current-user-id'; // Replace with actual user ID
      await joinGroupByCode(inviteCode, userId);
      onJoinSuccess(group.id);
      onClose();
      setInviteCode('');
      setGroup(null);
    } catch (error) {
      setError('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
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
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🤝</div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Join a Group</h2>
              <p className="text-sm text-gray-600">Enter the invite code to join</p>
            </div>

            {/* Invite Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full p-3 border border-gray-200 rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="loading loading-spinner loading-lg text-purple-500"></div>
                <p className="mt-2 text-sm text-gray-600">Checking invite code...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Group Preview */}
            {group && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {group.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                    <p className="text-xs text-purple-600">{group.members.length} members</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {group && (
                <button
                  onClick={handleJoinGroup}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Group'}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>How to get an invite code:</strong><br />
                • Ask a group member to share their invite code<br />
                • Or scan a QR code from another device<br />
                • Invite codes are 6 characters long
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
