import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import PostReactions from './PostReactions';
import PostComments from './PostComments';
import ImageViewer from './ImageViewer';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any; // Firebase timestamp
  imageUrl?: string;
  isPublic: boolean;
  reactions: any[];
  comments: any[];
  challengeId?: string;
}

interface EnhancedPostCardProps {
  post: Post;
  onReaction?: (emoji: string) => void;
  onComment?: (content: string) => void;
  onShare?: () => void;
  onSocialShare?: (post: Post) => void;
  className?: string;
}

export default function EnhancedPostCard({
  post,
  onReaction,
  onComment,
  onShare,
  onSocialShare,
  className = ''
}: EnhancedPostCardProps) {
  const { user } = useFirebaseAuth();
  const [showActions, setShowActions] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const formatTimeAgo = (date: any) => {
    const now = new Date();
    const postDate = date?.toDate ? date.toDate() : new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Joy from HappyMe+',
        text: post.content,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(post.content);
      // You could add a toast notification here
    }
    onShare?.();
  };

  const handleSocialShare = () => {
    onSocialShare?.(post);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
            {post.userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-800">{post.userName}</span>
              {post.isPublic && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  🌍 Public
                </span>
              )}
              {post.challengeId && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  🎯 Challenge
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
          </div>
          
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-lg">⋯</span>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mb-3">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full rounded-lg object-cover max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImageViewer(true)}
            />
          </div>
        )}
      </div>

      {/* Social Actions */}
      <div className="px-4 pb-4 space-y-3">
        {/* Reactions */}
        <PostReactions
          postId={post.id}
          onReaction={onReaction}
        />

        {/* Comments */}
        <PostComments
          postId={post.id}
          comments={post.comments || []}
          onAddComment={onComment}
        />

        {/* Share Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
              <span className="text-lg">📤</span>
              <span>Share Joy</span>
            </button>
            <button
              onClick={handleSocialShare}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <span className="text-lg">🌐</span>
              <span>Social Share</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>💫 {post.reactions?.length || 0} reactions</span>
            <span>💬 {post.comments?.length || 0} comments</span>
          </div>
        </div>
      </div>

      {/* Action Menu */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10"
        >
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>📤</span>
            <span>Share</span>
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(post.content)}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>📋</span>
            <span>Copy</span>
          </button>
        </motion.div>
      )}

      {/* Image Viewer */}
      <ImageViewer
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={post.imageUrl || ''}
        alt="Post image"
      />
    </motion.div>
  );
}
