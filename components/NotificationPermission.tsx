import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { initializePushNotifications, getFCMToken, updateAppBadge, clearAppBadge } from '../lib/pushNotifications';
import { updateFCMToken } from '../lib/userProfiles';
import { motion } from 'framer-motion';

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  className?: string;
}

export default function NotificationPermission({ onPermissionGranted, className = '' }: NotificationPermissionProps) {
  const { user } = useFirebaseAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitializing, setIsInitializing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Show prompt if permission is default and user is logged in
      if (Notification.permission === 'default' && user) {
        setShowPrompt(true);
      }
    }
  }, [user]);

  const handleEnableNotifications = async () => {
    if (!user?.uid) return;

    try {
      setIsInitializing(true);
      
      // Initialize push notifications
      await initializePushNotifications();
      
      // Get FCM token
      const token = await getFCMToken();
      if (token) {
        // Store token in user profile
        await updateFCMToken(user.uid, token);
        console.log('FCM token stored successfully');
      }
      
      // Update permission state
      setPermission(Notification.permission);
      setShowPrompt(false);
      
      // Call callback
      onPermissionGranted?.();
      
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't show anything if notifications are not supported
  if (!('Notification' in window)) {
    return null;
  }

  // Don't show if permission is already granted or denied
  if (permission !== 'default' || !showPrompt) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-100 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="text-3xl">🔔</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Stay Connected with Notifications
          </h3>
          <p className="text-gray-600 mb-4">
            Get notified when friends send you encouragement, invite you to groups, or when someone needs support. 
            We&apos;ll only send you meaningful notifications that bring joy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleEnableNotifications}
              disabled={isInitializing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInitializing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enabling...
                </span>
              ) : (
                'Enable Notifications'
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 font-medium py-2 px-6 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors duration-200"
            >
              Maybe Later
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            You can change this anytime in your settings
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Hook to manage notification badge
export function useNotificationBadge() {
  const updateBadge = (count: number) => {
    if (count > 0) {
      updateAppBadge(count);
    } else {
      clearAppBadge();
    }
  };

  return { updateBadge };
}
