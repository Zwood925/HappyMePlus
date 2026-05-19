import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirebaseAuth } from './useFirebaseAuth';
import { useHappyMoments } from './useHappyMoments';
import { useNotifications } from './useNotifications';
import { getUserProfile } from '../lib/community';

export function useHomePage() {
  const router = useRouter();
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
  const [inboxOpen, setInboxOpen] = useState(false);
  const [showVideoCelebration, setShowVideoCelebration] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Onboarding & Profile States
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showUsernameInvite, setShowUsernameInvite] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // 🚨 The Velvet Rope: Check for profile on load
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (!profile) {
            setIsOnboarding(true);
            setShowUsernameSetup(true);
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    };
    checkProfile();
  }, [user?.uid]);

  // Handlers
  const handleNotificationClick = useCallback((notification: any) => {
    if (notification.data?.action_url) {
      router.push(notification.data.action_url);
    }

    switch (notification.type) {
      case 'friend_request':
        setShowFriendRequests(true);
        break;
      case 'username_invite':
        setShowInvites(true);
        break;
      default:
        break;
    }
  }, [router]);

  const toggleInbox = useCallback(() => {
    setInboxOpen((prev) => {
      const newOpenState = !prev;
      if (newOpenState && unreadCount > 0) {
        setTimeout(() => markAllAsRead(), 10000);
      }
      return newOpenState;
    });
  }, [unreadCount, markAllAsRead]);

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
    inboxOpen,
    showVideoCelebration,
    showCreatePost,
    showUsernameSetup,
    isOnboarding,
    showUserSearch,
    showFriendRequests,
    showFriendsList,
    showUsernameInvite,
    showInvites,
    showSocialShare,
    selectedPost,
    showNotificationSettings,
    
    // Handlers
    handleNotificationClick,
    toggleInbox,
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
    setIsOnboarding,
    setShowUserSearch,
    setShowFriendRequests,
    setShowFriendsList,
    setShowUsernameInvite,
    setShowInvites,
    setShowSocialShare,
    setShowNotificationSettings,
    setShowVideoCelebration,
  };
}