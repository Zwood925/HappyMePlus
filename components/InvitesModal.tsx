import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getInvitesForUser, respondToInvite, Invite } from '../lib/community';

interface InvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteResponded?: () => void;
}

export default function InvitesModal({ isOpen, onClose, onInviteResponded }: InvitesModalProps) {
  const { user } = useFirebaseAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    if (!user?.displayName) return;

    setLoading(true);
    setError('');

    try {
      const userInvites = await getInvitesForUser(user.displayName);
      setInvites(userInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
      setError('Failed to load invites');
    } finally {
      setLoading(false);
    }
  }, [user?.displayName]);

  useEffect(() => {
    if (isOpen && user?.displayName) {
      loadInvites();
    }
  }, [isOpen, user?.displayName, loadInvites]);

  const handleRespond = async (inviteId: string, status: 'accepted' | 'rejected') => {
    setRespondingTo(inviteId);
    
    try {
      await respondToInvite(inviteId, status);
      
      // Remove the invite from the list
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
      
      onInviteResponded?.();
    } catch (error: any) {
      setError(error.message || 'Failed to respond to invite');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleClose = () => {
    if (!respondingTo) {
      setInvites([]);
      setError('');
      onClose();
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
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Invites</h2>
                <button
                  onClick={handleClose}
                  disabled={respondingTo !== null}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Respond to invites from other users
              </p>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg text-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={loadInvites}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              ) : invites.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📬</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No invites yet
                  </h3>
                  <p className="text-gray-600">
                    When someone invites you, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      {/* Inviter Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {invite.fromUser?.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            @{invite.fromUser?.username || 'unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {invite.fromUser?.displayName || 'Unknown User'}
                          </p>
                        </div>
                      </div>

                      {/* Message */}
                      {invite.message && (
                        <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-gray-700 text-sm">{invite.message}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRespond(invite.id!, 'accepted')}
                          disabled={respondingTo === invite.id}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {respondingTo === invite.id ? (
                            <div className="flex items-center justify-center">
                              <div className="loading loading-spinner loading-sm mr-2"></div>
                              Accepting...
                            </div>
                          ) : (
                            'Accept'
                          )}
                        </button>
                        <button
                          onClick={() => handleRespond(invite.id!, 'rejected')}
                          disabled={respondingTo === invite.id}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {respondingTo === invite.id ? (
                            <div className="flex items-center justify-center">
                              <div className="loading loading-spinner loading-sm mr-2"></div>
                              Declining...
                            </div>
                          ) : (
                            'Decline'
                          )}
                        </button>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 mt-2">
                        {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
