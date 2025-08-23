import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { sendUsernameInvite } from '../lib/community';

interface UsernameInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
}

export default function UsernameInviteModal({ 
  isOpen, 
  onClose, 
  onInviteSent 
}: UsernameInviteModalProps) {
  const { user } = useFirebaseAuth();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !username.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await sendUsernameInvite(user.uid, username.trim(), message.trim() || undefined);
      setSuccess(true);
      setUsername('');
      setMessage('');
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onInviteSent?.();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to send invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setUsername('');
      setMessage('');
      setError('');
      setSuccess(false);
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
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Invite Friend</h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Send an invite to someone using their username
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Invite Sent!
                  </h3>
                  <p className="text-gray-600">
                    Your friend will receive a notification about your invite.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        @
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      rows={3}
                      maxLength={200}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    <div className="text-right mt-1">
                      <span className="text-xs text-gray-500">
                        {message.length}/200
                      </span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!username.trim() || isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="loading loading-spinner loading-sm mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Invite ✨'
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
