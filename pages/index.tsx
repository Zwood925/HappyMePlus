import React from 'react';
import { motion } from 'framer-motion';
import { useHomePage } from '../hooks/useHomePage';
import HomeHeader from '../components/home/HomeHeader';
import SocialActions from '../components/home/SocialActions';
import MomentsFeed from '../components/home/MomentsFeed';
import CreatePostModal from '../components/home/CreatePostModal';
import NotificationsModal from '../components/home/NotificationsModal';
import WelcomeScreen from '../components/home/WelcomeScreen';
import VideoCelebration from '../components/VideoCelebration';
import SmileyButton from '../components/SmileyButton';
import SadFaceButton from '../components/SadFaceButton';
import DailyPrompt from '../components/DailyPrompt';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import BottomNavigation from '../components/BottomNavigation';
import UsernameSetupModal from '../components/UsernameSetupModal';
import UserSearch from '../components/UserSearch';
import FriendRequests from '../components/FriendRequests';
import FriendsList from '../components/FriendsList';
import ImageViewer from '../components/ImageViewer';
import UsernameInviteModal from '../components/UsernameInviteModal';
import InvitesModal from '../components/InvitesModal';
import SocialShareModal from '../components/SocialShareModal';
import JournalHistory from '../components/JournalHistory';
import FriendActivityFeed from '../components/FriendActivityFeed';
import NotificationSettings from '../components/NotificationSettings';
import AchievementsDisplay from '../components/AchievementsDisplay';
import CameraCapture from '../components/CameraCapture';

export default function HomePage() {
  const {
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
  } = useHomePage();

  if (!user) {
    return <WelcomeScreen />;
  }

  return (
    <>
      {/* Header */}
      <HomeHeader
        unreadCount={unreadCount}
        onInvitesClick={() => setShowInvites(true)}
        onFriendRequestsClick={() => setShowFriendRequests(true)}
        onJournalHistoryClick={() => setShowJournalHistory(true)}
        onNotificationsClick={toggleInbox}
        onCreatePostClick={() => setShowCreatePost(true)}
      />

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
        <SocialActions
          onUserSearchClick={() => setShowUserSearch(true)}
          onUsernameInviteClick={() => setShowUsernameInvite(true)}
          onFriendsListClick={() => setShowFriendsList(true)}
          onFriendActivityClick={() => setShowFriendActivity(true)}
          onUsernameSetupClick={() => setShowUsernameSetup(true)}
          onAchievementsClick={() => setShowAchievements(true)}
        />

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
          <MomentsFeed
            moments={recentMoments}
            loading={momentsLoading}
            onCreatePostClick={() => setShowCreatePost(true)}
            onImageViewerOpen={handleImageViewerOpen}
            userEmail={user.email || undefined}
          />
        </div>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleSubmit}
        input={input}
        onInputChange={setInput}
        selectedGroups={selectedGroups}
        onGroupsChange={setSelectedGroups}
        showGroupSelector={showGroupSelector}
        onToggleGroupSelector={() => setShowGroupSelector(!showGroupSelector)}
        selectedImage={selectedImage}
        imagePreview={imagePreview}
        onCameraClick={handleCameraClick}
        onGalleryClick={handleGalleryClick}
        onRemoveImage={removeImage}
        submitting={submitting}
      />

      {/* Video Celebration */}
      <VideoCelebration 
        isOpen={showVideoCelebration}
        onClose={() => setShowVideoCelebration(false)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={inboxOpen}
        onClose={toggleInbox}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notificationsLoading}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onNotificationSettingsClick={() => setShowNotificationSettings(true)}
      />

      {/* Username Setup Modal */}
      <UsernameSetupModal
        isOpen={showUsernameSetup}
        onClose={() => setShowUsernameSetup(false)}
        onComplete={(username) => {
          setShowUsernameSetup(false);
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

      {/* Achievements Display Modal */}
      <AchievementsDisplay
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

              {/* Camera Capture Modal */}
        <CameraCapture
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onPhotoTaken={handlePhotoTaken}
          onError={(error: string) => {
            console.error('Camera error:', error);
          }}
        />

      {/* Hidden file input for gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </>
  );
}
