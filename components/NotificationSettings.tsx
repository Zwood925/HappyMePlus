import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPreferences {
  friendRequests: boolean;
  usernameInvites: boolean;
  postReactions: boolean;
  postComments: boolean;
  dailyReminders: boolean;
  achievements: boolean;
  groupInvites: boolean;
  supportRequests: boolean;
  encouragements: boolean;
}

export default function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const { user } = useFirebaseAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    friendRequests: true,
    usernameInvites: true,
    postReactions: true,
    postComments: true,
    dailyReminders: true,
    achievements: true,
    groupInvites: true,
    supportRequests: true,
    encouragements: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadPreferences();
    }
  }, [isOpen, user?.uid]);

  const loadPreferences = async () => {
    // In a real app, you'd load from Firebase
    // For now, we'll use localStorage
    const saved = localStorage.getItem(`notification_preferences_${user?.uid}`);
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };

  const savePreferences = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      // In a real app, you'd save to Firebase
      // For now, we'll use localStorage
      localStorage.setItem(`notification_preferences_${user?.uid}`, JSON.stringify(preferences));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friendRequests': return '👥';
      case 'usernameInvites': return '📬';
      case 'postReactions': return '💖';
      case 'postComments': return '💬';
      case 'dailyReminders': return '✨';
      case 'achievements': return '🏆';
      case 'groupInvites': return '🎉';
      case 'supportRequests': return '💙';
      case 'encouragements': return '💝';
      default: return '🔔';
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'friendRequests': return 'Friend Requests';
      case 'usernameInvites': return 'Username Invites';
      case 'postReactions': return 'Post Reactions';
      case 'postComments': return 'Post Comments';
      case 'dailyReminders': return 'Daily Reminders';
      case 'achievements': return 'Achievements';
      case 'groupInvites': return 'Group Invites';
      case 'supportRequests': return 'Support Requests';
      case 'encouragements': return 'Encouragements';
      default: return 'Notifications';
    }
  };

  const getNotificationDescription = (type: string) => {
    switch (type) {
      case 'friendRequests': return 'When someone sends you a friend request';
      case 'usernameInvites': return 'When someone invites you by username';
      case 'postReactions': return 'When someone reacts to your posts';
      case 'postComments': return 'When someone comments on your posts';
      case 'dailyReminders': return 'Gentle reminders to share your joy';
      case 'achievements': return 'When you unlock new achievements';
      case 'groupInvites': return 'When someone invites you to a group';
      case 'supportRequests': return 'When someone in your group needs support';
      case 'encouragements': return 'When someone sends you encouragement';
      default: return 'General notifications';
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Notification Settings</h2>
                  <p className="text-gray-600 mt-1">Choose what notifications you want to receive</p>
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
              <div className="space-y-4">
                {Object.entries(preferences).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getNotificationIcon(key)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {getNotificationLabel(key)}
                        </h3>
                        <p className="text-gray-600 text-xs mt-1">
                          {getNotificationDescription(key)}
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleToggle(key as keyof NotificationPreferences)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        value ? 'bg-purple-500' : 'bg-gray-300'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={savePreferences}
                  disabled={loading}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : saved ? (
                    <div className="flex items-center">
                      <span className="mr-2">✓</span>
                      Saved!
                    </div>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
