import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { trackSocialShare } from '../lib/community';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    imageUrl?: string;
    userName: string;
  };
}

export default function SocialShareModal({ 
  isOpen, 
  onClose, 
  post 
}: SocialShareModalProps) {
  const { user } = useFirebaseAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  const shareOptions = [
    {
      platform: 'twitter' as const,
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    },
    {
      platform: 'whatsapp' as const,
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      url: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`
    },
    {
      platform: 'facebook' as const,
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: (text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`
    },
    {
      platform: 'copy' as const,
      name: 'Copy Link',
      icon: '📋',
      color: 'bg-gray-500 hover:bg-gray-600',
      url: null
    }
  ];

  const handleShare = async (platform: 'twitter' | 'whatsapp' | 'facebook' | 'copy') => {
    setIsSharing(true);
    
    try {
      const shareText = `"${post.content}" - Shared by @${post.userName} on HappyMe+ ✨`;
      
      if (platform === 'copy') {
        // Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        setShareSuccess('Copied to clipboard!');
      } else {
        // Open social media platform
        const shareOption = shareOptions.find(option => option.platform === platform);
        if (shareOption?.url) {
          const shareUrl = shareOption.url(shareText);
          window.open(shareUrl, '_blank', 'width=600,height=400');
          setShareSuccess(`Shared to ${shareOption.name}!`);
        }
      }
      
      // Track the share
      if (user?.uid) {
        await trackSocialShare(user.uid, post.id, platform);
      }
      
      setTimeout(() => {
        setShareSuccess(null);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error sharing:', error);
      setShareSuccess('Failed to share. Please try again.');
      
      setTimeout(() => {
        setShareSuccess(null);
      }, 2000);
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    if (!isSharing) {
      setShareSuccess(null);
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
                <h2 className="text-xl font-bold text-gray-800">Share Joy</h2>
                <button
                  onClick={handleClose}
                  disabled={isSharing}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Spread happiness by sharing this moment
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {shareSuccess ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {shareSuccess}
                  </h3>
                  <p className="text-gray-600">
                    Thanks for spreading joy!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Post Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 text-sm mb-2">
                      &ldquo;{post.content}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500">
                      - @{post.userName}
                    </p>
                  </div>

                  {/* Share Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {shareOptions.map((option) => (
                      <button
                        key={option.platform}
                        onClick={() => handleShare(option.platform)}
                        disabled={isSharing}
                        className={`${option.color} text-white font-semibold py-4 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-2`}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <span className="text-sm">{option.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Share Message */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Share this moment of joy with the world! ✨
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
