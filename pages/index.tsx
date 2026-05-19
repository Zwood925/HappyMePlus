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
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import BottomNavigation from '../components/BottomNavigation';
import UsernameSetupModal from '../components/UsernameSetupModal';
import UserSearch from '../components/UserSearch';
import FriendRequests from '../components/FriendRequests';
import FriendsList from '../components/FriendsList';
import UsernameInviteModal from '../components/UsernameInviteModal';
import InvitesModal from '../components/InvitesModal';
import SocialShareModal from '../components/SocialShareModal';
import NotificationSettings from '../components/NotificationSettings';

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
        onNotificationsClick={toggleInbox}
        onCreatePostClick={() => setShowCreatePost(true)}
      />

      {/* Main Content */}
      <div className="pt-16 pb-20 min-h-screen bg-gray-50">

        {/* Quick Actions */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex justify-center space-x-8">
            <SmileyButton onClick={handleHappyParty} />
          </div>
        </div>

        {/* Create Post Trigger */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-inner">
              {user.email?.charAt(0).toUpperCase() || '✨'}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-left text-gray-500 px-4 py-3 rounded-full text-sm shadow-sm"
            >
              What made you smile today? ✨
            </button>
          </div>
        </div>

        {/* Social Actions */}
        <SocialActions
          onUserSearchClick={() => setShowUserSearch(true)}
          onUsernameInviteClick={() => setShowUsernameInvite(true)}
          onFriendsListClick={() => setShowFriendsList(true)}
          onUsernameSetupClick={() => setShowUsernameSetup(true)}
        />

        {/* Feed */}
        <div className="p-4">
          <MomentsFeed
            moments={recentMoments}
            loading={momentsLoading}
            onCreatePostClick={() => setShowCreatePost(true)}
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
        isOnboarding={isOnboarding}
        onClose={() => setShowUsernameSetup(false)}
        onComplete={(username) => {
          setShowUsernameSetup(false);
          setIsOnboarding(false);
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

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </>
  );
}