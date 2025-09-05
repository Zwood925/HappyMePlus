import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getFriendActivity, addReaction, addComment, Post } from '../lib/community';
import EnhancedPostCard from './EnhancedPostCard';

interface FriendActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendActivityFeed({ isOpen, onClose }: FriendActivityFeedProps) {
  const { user } = useFirebaseAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFriendActivity = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError('');
    
    try {
      const friendPosts = await getFriendActivity(user.uid);
      setPosts(friendPosts);
    } catch (error: any) {
      setError(error.message || 'Failed to load friend activity');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadFriendActivity();
    }
  }, [isOpen, user?.uid, loadFriendActivity]);

  const handlePostReaction = async (postId: string, emoji: string) => {
    if (!user?.uid) return;
    
    try {
      await addReaction(postId, user.uid, emoji);
      // Refresh the feed to show updated reactions
      loadFriendActivity();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handlePostComment = async (postId: string, content: string) => {
    if (!user?.uid || !user?.displayName) return;
    
    try {
      await addComment(postId, user.uid, user.displayName, content);
      // Refresh the feed to show new comment
      loadFriendActivity();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handlePostShare = (postId: string) => {
    // Handle post share logic
    console.log(`Shared post ${postId}`);
  };

  const handleSocialShare = (post: Post) => {
    // Handle social share logic
    console.log('Social share:', post);
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
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Friend Activity</h2>
                  <p className="text-gray-600 mt-1">See what your friends are sharing</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg text-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={loadFriendActivity}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No friend activity yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    When your friends share posts, they&apos;ll appear here.
                  </p>
                  <button
                    onClick={loadFriendActivity}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <EnhancedPostCard
                      key={post.id}
                      post={post}
                      onReaction={(emoji) => handlePostReaction(post.id, emoji)}
                      onComment={(content) => handlePostComment(post.id, content)}
                      onShare={() => handlePostShare(post.id)}
                      onSocialShare={handleSocialShare}
                    />
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
