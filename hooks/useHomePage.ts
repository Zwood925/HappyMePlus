import { useState, useCallback, useRef } from 'react';
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState<string>('');
  const [showUsernameInvite, setShowUsernameInvite] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showJournalHistory, setShowJournalHistory] = useState(false);
  const [showFriendActivity, setShowFriendActivity] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Refs
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      case 'daily_reminder':
        setShowCreatePost(true);
        break;
      case 'achievement':
        console.log('Show achievement:', notification.data?.achievement_type);
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

    const success = await addMoment(input.trim(), selectedGroups, selectedImage || undefined);
    if (success) {
      setInput("");
      setSelectedGroups([]);
      setSelectedImage(null);
      setImagePreview(null);
      setShowGroupSelector(false);
      setShowCreatePost(false);
    }
  }, [input, user, selectedGroups, selectedImage, addMoment]);

  const handleHappyParty = useCallback(() => {
    setShowVideoCelebration(true);
  }, []);

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCameraClick = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleGalleryClick = useCallback(() => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  }, []);

  const handlePhotoTaken = useCallback((file: File) => {
    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setShowCamera(false);
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  }, []);

  const handleImageViewerOpen = useCallback((imageUrl: string) => {
    setViewerImageUrl(imageUrl);
    setShowImageViewer(true);
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
    selectedImage,
    imagePreview,
    showCamera,
    showUsernameSetup,
    showUserSearch,
    showFriendRequests,
    showFriendsList,
    showImageViewer,
    viewerImageUrl,
    showUsernameInvite,
    showInvites,
    showSocialShare,
    selectedPost,
    showJournalHistory,
    showFriendActivity,
    showNotificationSettings,
    showAchievements,
    
    // Refs
    galleryInputRef,
    
    // Handlers
    handleNotificationClick,
    toggleInbox,
    handleFeelingDown,
    handleSubmit,
    handleHappyParty,
    handleImageSelect,
    handleCameraClick,
    handleGalleryClick,
    handlePhotoTaken,
    removeImage,
    handleImageViewerOpen,
    
    // Actions
    markAsRead,
    markAllAsRead,
    setInput,
    setSelectedGroups,
    setShowGroupSelector,
    setShowCreatePost,
    setShowCamera,
    setShowUsernameSetup,
    setShowUserSearch,
    setShowFriendRequests,
    setShowFriendsList,
    setShowImageViewer,
    setShowUsernameInvite,
    setShowInvites,
    setShowSocialShare,
    setShowJournalHistory,
    setShowFriendActivity,
    setShowNotificationSettings,
    setShowAchievements,
    setShowVideoCelebration,
  };
}
