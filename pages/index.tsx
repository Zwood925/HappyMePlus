// HomePage with full visuals and original logic from index.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useHappyMoments } from "../hooks/useHappyMoments";
import { useNotifications } from "../hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import VideoCelebration from "../components/VideoCelebration";
import SmileyButton from "../components/SmileyButton";
import SadFaceButton from "../components/SadFaceButton";
import GroupSelector from "../components/GroupSelector";
import DailyPrompt from "../components/DailyPrompt";
import NotificationPermission from "../components/NotificationPermission";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import BottomNavigation from "../components/BottomNavigation";
import UsernameSetupModal from "../components/UsernameSetupModal";
import UserSearch from "../components/UserSearch";
import FriendRequests from "../components/FriendRequests";
import FriendsList from "../components/FriendsList";
import ImageViewer from "../components/ImageViewer";
import UsernameInviteModal from "../components/UsernameInviteModal";
import InvitesModal from "../components/InvitesModal";
import SocialShareModal from "../components/SocialShareModal";
import JournalHistory from "../components/JournalHistory";
import FriendActivityFeed from "../components/FriendActivityFeed";
import EnhancedNotificationItem from "../components/EnhancedNotificationItem";
import NotificationSettings from "../components/NotificationSettings";

export default function HomePage() {
  const { user } = useFirebaseAuth();
  const { 
    recentMoments, 
    loading: momentsLoading, 
    submitting, 
    totalCount,
    error,
    addMoment 
  } = useHappyMoments();

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [input, setInput] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [showVideoCelebration, setShowVideoCelebration] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
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

  const handleNotificationClick = (notification: any) => {
    // Handle different notification types
    switch (notification.type) {
      case 'friend_request':
        setShowFriendRequests(true);
        break;
      case 'username_invite':
        setShowInvites(true);
        break;
      case 'post_reaction':
      case 'post_comment':
        // Could navigate to the specific post
        console.log('Navigate to post:', notification.data?.post_id);
        break;
      case 'daily_reminder':
        setShowCreatePost(true);
        break;
      case 'achievement':
        // Could show achievement modal
        console.log('Show achievement:', notification.data?.achievement_type);
        break;
      default:
        // Default behavior - just close the notification modal
        break;
    }
  };

  const toggleInbox = () => {
    setInboxOpen((prev) => {
      const newOpenState = !prev;
      if (newOpenState && unreadCount > 0) {
        setTimeout(() => markAllAsRead(), 10000);
      }
      return newOpenState;
    });
  };

  const handleFeelingDown = async () => {
    // TODO: Implement encouragement system
    setEncouragement("You're doing great! Remember, every day is a new opportunity to find joy. 🌟");
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  const handleHappyParty = () => {
    setShowVideoCelebration(true);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to HappyMe+
          </h1>
          <p className="text-gray-600 mb-8">
            A social media of joy, not comparison. Share what makes you smile and spread happiness with the world.
          </p>
          <div className="space-y-4">
            <Link href="/login">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Get Started
              </button>
            </Link>
            <Link href="/signup">
              <button className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">✨</div>
            <h1 className="text-xl font-bold text-gray-800">HappyMe+</h1>
          </div>
          
                               <div className="flex items-center space-x-3">
            {/* Invites */}
            <button
              onClick={() => setShowInvites(true)}
              className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <span className="text-xl">📬</span>
            </button>
            
            {/* Friend Requests */}
            <button
              onClick={() => setShowFriendRequests(true)}
              className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <span className="text-xl">👥</span>
            </button>
            
            {/* Journal History */}
            <button
              onClick={() => setShowJournalHistory(true)}
              className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <span className="text-xl">📝</span>
            </button>
            
            {/* Notifications */}
            <button
              onClick={toggleInbox}
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
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-xl">✏️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
        {/* Daily Prompt Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <DailyPrompt onResponseSubmitted={() => {}} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex justify-center space-x-8">
            <SmileyButton onClick={handleHappyParty} />
            <SadFaceButton onClick={handleFeelingDown} />
          </div>
        </div>

                 {/* Social Actions */}
         <div className="bg-white p-4 border-b border-gray-200">
                       <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowUserSearch(true)}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>🔍</span>
                <span className="text-sm font-medium">Find Friends</span>
              </button>
              <button
                onClick={() => setShowUsernameInvite(true)}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <span>📤</span>
                <span className="text-sm font-medium">Invite @User</span>
              </button>
              <button
                onClick={() => setShowFriendsList(true)}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <span>👥</span>
                <span className="text-sm font-medium">My Friends</span>
              </button>
              <button
                onClick={() => setShowFriendActivity(true)}
                className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <span>🌟</span>
                <span className="text-sm font-medium">Friend Activity</span>
              </button>
              <button
                onClick={() => setShowUsernameSetup(true)}
                className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors col-span-2"
              >
                <span>✨</span>
                <span className="text-sm font-medium">Setup Profile</span>
              </button>
            </div>
         </div>

        {/* Encouragement Message */}
        {encouragement && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded-r-lg"
          >
            <p className="text-blue-800 font-medium">✨ {encouragement}</p>
          </motion.div>
        )}

        {/* Feed */}
        <div className="p-4">
          {momentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading loading-spinner loading-lg text-purple-500"></div>
            </div>
          ) : recentMoments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No happy moments yet</h3>
              <p className="text-gray-500 mb-6">Share your first moment of joy!</p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Share Joy
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMoments.map((moment) => (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{moment.content}</p>
                      
                      {/* Image Display */}
                      {moment.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={moment.imageUrl}
                            alt="Happy moment"
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              if (moment.imageUrl) {
                                setViewerImageUrl(moment.imageUrl);
                                setShowImageViewer(true);
                              }
                            }}
                          />
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500 mt-2">
                        {moment.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Share Your Joy</h3>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                {/* Photo Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a Photo 📸
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      📷 Camera
                    </button>
                    <button
                      type="button"
                      onClick={handleGalleryClick}
                      className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      🖼️ Gallery
                    </button>
                  </div>
                  
                  {/* Hidden file inputs */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="What made you smile today? Share your joy with the world! ✨"
                />
                
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowGroupSelector(!showGroupSelector)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    {showGroupSelector ? 'Hide' : 'Share with Groups'} 
                    {selectedGroups.length > 0 && ` (${selectedGroups.length} selected)`}
                  </button>
                  
                  {showGroupSelector && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <GroupSelector
                        selectedGroups={selectedGroups}
                        onGroupsChange={setSelectedGroups}
                        title="Share with Groups"
                        description="Choose which groups to share this moment with:"
                        maxSelection={3}
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={!input.trim() || submitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="loading loading-spinner loading-sm mr-2"></div>
                        Sharing...
                      </div>
                    ) : (
                      'Share Joy ✨'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Celebration */}
      <VideoCelebration 
        isOpen={showVideoCelebration}
        onClose={() => setShowVideoCelebration(false)}
      />

      {/* Notifications Modal */}
      <AnimatePresence>
        {inboxOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={toggleInbox}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <button onClick={toggleInbox} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {notificationsLoading ? (
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
                         onClick={() => handleNotificationClick(notification)}
                         onMarkAsRead={() => markAsRead(notification.id!)}
                       />
                     ))}
                   </div>
                )}
              </div>

                             {unreadCount > 0 && (
                 <div className="p-4 border-t border-gray-200">
                   <button
                     onClick={() => markAllAsRead()}
                     className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
                   >
                     Mark all as read
                   </button>
                 </div>
               )}
               
               <div className="p-4 border-t border-gray-200">
                 <button
                   onClick={() => setShowNotificationSettings(true)}
                   className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                 >
                   ⚙️ Notification Settings
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Username Setup Modal */}
      <UsernameSetupModal
        isOpen={showUsernameSetup}
        onClose={() => setShowUsernameSetup(false)}
        onComplete={(username) => {
          setShowUsernameSetup(false);
          // You could show a success message here
        }}
      />

      {/* User Search Modal */}
      <UserSearch
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
      />

      {/* Friend Requests Modal */}
      <FriendRequests
        isOpen={showFriendRequests}
        onClose={() => setShowFriendRequests(false)}
      />

      {/* Friends List Modal */}
      <FriendsList
        isOpen={showFriendsList}
        onClose={() => setShowFriendsList(false)}
      />

      {/* Image Viewer */}
      <ImageViewer
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={viewerImageUrl}
        alt="Happy moment"
      />

      {/* Username Invite Modal */}
      <UsernameInviteModal
        isOpen={showUsernameInvite}
        onClose={() => setShowUsernameInvite(false)}
        onInviteSent={() => {
          // Could refresh friend requests or show success message
        }}
      />

      {/* Invites Modal */}
      <InvitesModal
        isOpen={showInvites}
        onClose={() => setShowInvites(false)}
        onInviteResponded={() => {
          // Could refresh friend requests
        }}
      />

             {/* Social Share Modal */}
       <SocialShareModal
         isOpen={showSocialShare}
         onClose={() => setShowSocialShare(false)}
         post={selectedPost || { id: '', content: '', userName: '' }}
       />

               {/* Journal History Modal */}
        <JournalHistory
          isOpen={showJournalHistory}
          onClose={() => setShowJournalHistory(false)}
        />

        {/* Friend Activity Feed Modal */}
        <FriendActivityFeed
          isOpen={showFriendActivity}
          onClose={() => setShowFriendActivity(false)}
        />

        {/* Notification Settings Modal */}
        <NotificationSettings
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />
    </>
  );
}
