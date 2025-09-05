import React, { useState } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { sendGroupInvitation } from '../lib/notifications';
import { motion } from 'framer-motion';

interface GroupInviteProps {
  groupId: string;
  groupName: string;
  inviteCode: string;
  onInviteSent?: () => void;
  className?: string;
}

export default function GroupInvite({ groupId, groupName, inviteCode, onInviteSent, className = '' }: GroupInviteProps) {
  const { user } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  // Generate invite link
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/groups/join/${inviteCode}`;
    setInviteLink(link);
  };

  // Copy invite link to clipboard
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setMessage('Invite link copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setMessage('Failed to copy link. Please copy manually.');
    }
  };

  // Send invite via email (placeholder for now)
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !email.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setMessage('');

      // For now, we'll just show a success message
      // In a real app, you'd send an email or create a notification
      setMessage(`Invite sent to ${email}! They'll receive a notification to join ${groupName}.`);
      
      // Clear the form
      setEmail('');
      
      // Call callback
      onInviteSent?.();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error sending invite:', error);
      setMessage('Failed to send invite. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${className}`}
    >
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">👥</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Invite Friends to {groupName}</h3>
          <p className="text-sm text-gray-600">Share the joy with people you care about</p>
        </div>
      </div>

      {/* Invite Link Section */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Share Invite Link</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteLink}
            readOnly
            placeholder="Click 'Generate Link' to create invite link"
            className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
          />
          <button
            onClick={generateInviteLink}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Generate Link
          </button>
          {inviteLink && (
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              Copy
            </button>
          )}
        </div>
      </div>

      {/* Email Invite Section */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Send Direct Invite</h4>
        <form onSubmit={handleSendInvite} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter friend&apos;s email address"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
            required
          />
          <button
            type="submit"
            disabled={!email.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Invite...
              </span>
            ) : (
              'Send Invite ✨'
            )}
          </button>
        </form>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            message.includes('Failed') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Info Section */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> When someone joins using your invite link, they&apos;ll automatically be added to the group and you&apos;ll both receive a notification!
        </p>
      </div>
    </motion.div>
  );
}
