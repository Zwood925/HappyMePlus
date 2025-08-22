import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface PostCommentsProps {
  postId: string;
  comments?: Comment[];
  onAddComment?: (content: string) => void;
  className?: string;
}

const ENCOURAGING_COMMENTS = [
  "This made me smile! 😊",
  "You're doing great! 🌟",
  "Keep spreading joy! ✨",
  "This is beautiful! 💖",
  "You inspire me! 🎉",
  "Thank you for sharing! 🤗"
];

export default function PostComments({ 
  postId, 
  comments = [], 
  onAddComment,
  className = '' 
}: PostCommentsProps) {
  const { user } = useFirebaseAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showQuickComments, setShowQuickComments] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    onAddComment?.(newComment.trim());
    setNewComment('');
    setShowQuickComments(false);
  };

  const handleQuickComment = (comment: string) => {
    onAddComment?.(comment);
    setShowQuickComments(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={className}>
      {/* Comments Toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
      >
        <span className="text-lg">💬</span>
        <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
      </button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            {/* Add Comment */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-3">
                <form onSubmit={handleSubmitComment} className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an encouraging comment..."
                    className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowQuickComments(!showQuickComments)}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      💡 Quick comments
                    </button>
                    
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>

                  {/* Quick Comments */}
                  <AnimatePresence>
                    {showQuickComments && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-2 gap-2 pt-2"
                      >
                        {ENCOURAGING_COMMENTS.map((comment) => (
                          <button
                            key={comment}
                            type="button"
                            onClick={() => handleQuickComment(comment)}
                            className="text-xs bg-white border border-gray-200 rounded-lg p-2 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                          >
                            {comment}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-2">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border border-gray-100 rounded-lg p-3"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No comments yet. Be the first to encourage! 💖
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
