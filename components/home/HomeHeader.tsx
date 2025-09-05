import React from 'react';
import { motion } from 'framer-motion';

interface HomeHeaderProps {
  unreadCount: number;
  onInvitesClick: () => void;
  onFriendRequestsClick: () => void;
  onJournalHistoryClick: () => void;
  onNotificationsClick: () => void;
  onCreatePostClick: () => void;
}

export default function HomeHeader({
  unreadCount,
  onInvitesClick,
  onFriendRequestsClick,
  onJournalHistoryClick,
  onNotificationsClick,
  onCreatePostClick
}: HomeHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">✨</div>
          <h1 className="text-xl font-bold text-gray-800">HappyMe+</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Invites */}
          <button
            onClick={onInvitesClick}
            className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <span className="text-xl">📬</span>
          </button>
          
          {/* Friend Requests */}
          <button
            onClick={onFriendRequestsClick}
            className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <span className="text-xl">👥</span>
          </button>
          
          {/* Journal History */}
          <button
            onClick={onJournalHistoryClick}
            className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <span className="text-xl">📝</span>
          </button>
          
          {/* Notifications */}
          <button
            onClick={onNotificationsClick}
            className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Create Post Button */}
          <button
            onClick={onCreatePostClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-xl">✏️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
