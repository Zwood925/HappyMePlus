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

const handleNotificationClick = useCallback((notification: any) => {
    // 1. Intercept ALL problematic or modal-based notifications first!
    switch (notification.type) {
      case 'friend_request':
        setShowFriendRequests(true);
        return; 
      case 'username_invite':
        setShowInvites(true);
        return; 
      case 'post_reaction':
      case 'post_comment':
        // We don't have a standalone post page, so just stay on the home feed
        router.push('/');
        return;
      case 'support_request':
        // Send them to the specific Pod feed instead of a dead support URL
        if (notification.data?.group_id) {
          router.push(`/groups/${notification.data.group_id}`);
        }
        return;
      default:
        break;
    }

    // 2. If it safely passed the intercepts, navigate!
    if (notification.data?.action_url) {
      router.push(notification.data.action_url);
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