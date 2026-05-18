import { useState, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { useHappyMoments } from './useHappyMoments';
import { useNotifications } from './useNotifications';

export function useHomePage() {
  const { user } = useFirebaseAuth();
  const { 
    recentMoments, 
    loading: momentsLoading, 
    submitting, 
    addMoment 
  } = useHappyMoments();

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // State
  const [input, setInput] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [showVideoCelebration, setShowVideoCelebration] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showUsernameInvite, setShowUsernameInvite] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFriendActivity, setShowFriendActivity] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Handlers
  const handleNotificationClick = useCallback((notification: any) => {
    switch (notification.type) {
      case 'friend_request':
        setShowFriendRequests(true);
        break;
      case 'username_invite':
        setShowInvites(true);
        break;
      case 'post_reaction':
      case 'post_comment':
        console.log('Navigate to post:', notification.data?.post_id);
        break;
      default:
        break;
    }
  }, []);

  const toggleInbox = useCallback(() => {
    setInboxOpen((prev) => {
      const newOpenState = !prev;
      if (newOpenState && unreadCount > 0) {
        setTimeout(() => markAllAsRead(), 10000);
      }
      return newOpenState;
    });
  }, [unreadCount, markAllAsRead]);

  const handleFeelingDown = useCallback(async () => {
    setEncouragement("You're doing great! Remember, every day is a new opportunity to find joy. 🌟");
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const success = await addMoment(input.trim(), selectedGroups);
    if (success) {
      setInput("");
      setSelectedGroups([]);
      setShowGroupSelector(false);
      setShowCreatePost(false);
    }
  }, [input, user, selectedGroups, addMoment]);

  const handleHappyParty = useCallback(() => {
    setShowVideoCelebration(true);
  }, []);

  return {
    // State
    user,
    recentMoments,
    momentsLoading,
    submitting,
    notifications,
    unreadCount,
    notificationsLoading,
    input,
    selectedGroups,
    showGroupSelector,
    encouragement,
    inboxOpen,
    showVideoCelebration,
    showCreatePost,
    showUsernameSetup,
    showUserSearch,
    showFriendRequests,
    showFriendsList,
    showUsernameInvite,
    showInvites,
    showSocialShare,
    selectedPost,
    showFriendActivity,
    showNotificationSettings,
    
    // Handlers
    handleNotificationClick,
    toggleInbox,
    handleFeelingDown,
    handleSubmit,
    handleHappyParty,
    
    // Actions
    markAsRead,
    markAllAsRead,
    setInput,
    setSelectedGroups,
    setShowGroupSelector,
    setShowCreatePost,
    setShowUsernameSetup,
    setShowUserSearch,
    setShowFriendRequests,
    setShowFriendsList,
    setShowUsernameInvite,
    setShowInvites,
    setShowSocialShare,
    setShowFriendActivity,
    setShowNotificationSettings,
    setShowVideoCelebration,
  };
}