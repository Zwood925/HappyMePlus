import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  deleteOldNotifications,
  Notification
} from '../lib/notifications';
import { updateAppBadge, clearAppBadge } from '../lib/pushNotifications';

export function useNotifications() {
  const { user } = useFirebaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        getUserNotifications(user.uid),
        getUnreadNotificationCount(user.uid)
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  }, [user?.uid]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
      clearAppBadge();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  }, [user?.uid]);

  // Clean up old notifications
  const cleanupOldNotifications = useCallback(async (daysOld: number = 30) => {
    if (!user?.uid) return;

    try {
      await deleteOldNotifications(user.uid, daysOld);
      await loadNotifications(); // Reload to reflect changes
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      setError('Failed to clean up old notifications');
    }
  }, [user?.uid, loadNotifications]);

  // Set up real-time listener
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial load
    loadNotifications();

    // Set up real-time listener
    const unsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
      
      // Update unread count
      const unread = newNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      // Update app badge
      if (unread > 0) {
        updateAppBadge(unread);
      } else {
        clearAppBadge();
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [user?.uid, loadNotifications]);

  // Auto-cleanup old notifications every week
  useEffect(() => {
    if (!user?.uid) return;

    const cleanup = () => {
      cleanupOldNotifications(30);
    };

    // Clean up on mount
    cleanup();

    // Set up weekly cleanup
    const interval = setInterval(cleanup, 7 * 24 * 60 * 60 * 1000); // 7 days

    return () => clearInterval(interval);
  }, [user?.uid, cleanupOldNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    cleanupOldNotifications,
  };
}
