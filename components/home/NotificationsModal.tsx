import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedNotificationItem from '../EnhancedNotificationItem';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  onNotificationClick: (notification: any) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationSettingsClick: () => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationSettingsClick
}: NotificationsModalProps) {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg text-purple-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-gray-500">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <EnhancedNotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => onNotificationClick(notification)}
                      onMarkAsRead={() => onMarkAsRead(notification.id!)}
                    />
                  ))}
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={onMarkAllAsRead}
                  className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onNotificationSettingsClick}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ⚙️ Notification Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
