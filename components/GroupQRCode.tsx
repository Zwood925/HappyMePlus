import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GroupQRCodeProps {
  inviteCode: string;
  groupName: string;
  onClose: () => void;
}

export default function GroupQRCode({ inviteCode, groupName, onClose }: GroupQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code using a free service
    const qrData = `happymeplus://join/${inviteCode}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    setQrCodeUrl(qrUrl);
  }, [inviteCode]);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    // You could add a toast notification here
  };

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on HappyMe+`,
          text: `Join my group "${groupName}" on HappyMe+! Use invite code: ${inviteCode}`,
          url: `happymeplus://join/${inviteCode}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      copyInviteCode();
    }
  };

  return (
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
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Invite Friends</h2>
          <p className="text-sm text-gray-600">Join {groupName}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            )}
          </div>
        </div>

        {/* Invite Code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invite Code
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 p-3 rounded-lg border">
              <code className="text-lg font-mono text-gray-800">{inviteCode}</code>
            </div>
            <button
              onClick={copyInviteCode}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              📋
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={shareInvite}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            📤 Share Invite
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>How to join:</strong><br />
            1. Scan the QR code with another device<br />
            2. Or share the invite code with friends<br />
            3. They can enter the code in the app
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
