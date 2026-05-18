import React from 'react';
import { motion } from 'framer-motion';
import { Notification } from '../lib/notifications';

interface EnhancedNotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
}

export default function EnhancedNotificationItem({ 
  notification, 
  onClick, 
  onMarkAsRead 
}: EnhancedNotificationItemProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'friend_request':
        return '👥';
      case 'username_invite':
        return '📬';
      case 'post_reaction':
        return notification.data?.reaction_emoji || '💖';
      case 'post_comment':
        return '💬';
      case 'group_invite':
        return '🎉';
      case 'support_request':
        return '💙';
      case 'encouragement':
        return '💝';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getNotificationColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200';
      case 'medium':
        return 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200';
      case 'low':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getNotificationBorder = () => {
    if (!notification.read) {
      return 'border-l-4 border-purple-400';
    }
    return '';
  };

  const formatTime = (date: any) => {
    const d = date?.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-lg border ${getNotificationColor()} ${getNotificationBorder()} cursor-pointer transition-all duration-200 hover:shadow-md`}
      onClick={() => {
        if (!notification.read) {
          onMarkAsRead();
        }
        onClick();
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {getNotificationIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                {notification.title}
              </h4>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>
            
            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
            )}
          </div>
          
          {/* Time */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatTime(notification.created_at)}
            </span>
            
            {/* Priority indicator */}
            {notification.priority === 'high' && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Important
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
