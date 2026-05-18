import React from 'react';

interface SocialActionsProps {
  onUserSearchClick: () => void;
  onUsernameInviteClick: () => void;
  onFriendsListClick: () => void;
  onFriendActivityClick: () => void;
  onUsernameSetupClick: () => void;
}

export default function SocialActions({
  onUserSearchClick,
  onUsernameInviteClick,
  onFriendsListClick,
  onFriendActivityClick,
  onUsernameSetupClick,
}: SocialActionsProps) {
  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onUserSearchClick}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <span>🔍</span>
          <span className="text-sm font-medium">Find Friends</span>
        </button>
        <button
          onClick={onUsernameInviteClick}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <span>📤</span>
          <span className="text-sm font-medium">Invite @User</span>
        </button>
        <button
          onClick={onFriendsListClick}
          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <span>👥</span>
          <span className="text-sm font-medium">My Friends</span>
        </button>
        <button
          onClick={onFriendActivityClick}
          className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <span>🌟</span>
          <span className="text-sm font-medium">Friend Activity</span>
        </button>
        <button
          onClick={onUsernameSetupClick}
          className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <span>✨</span>
          <span className="text-sm font-medium">Setup Profile</span>
        </button>
      </div>
    </div>
  );
}
