import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { getUserGroups, createGroup, joinGroup, deleteGroup, leaveGroup, getGroupMembers, Group } from '../../lib/groups';
import { getFriends, getUserProfile, UserProfile } from '../../lib/community';
import { sendGroupInvitation } from '../../lib/notifications';
import { withAuth } from '../../lib/withAuth';
import BottomNavigation from '../../components/BottomNavigation';
import { useRouter } from 'next/router';

// Fun group themes and colors
const GROUP_THEMES = {
  family: { name: 'Family', emoji: '👨‍👩‍👧‍👦', color: 'from-pink-400 to-purple-500', bg: 'bg-gradient-to-r from-pink-400 to-purple-500' },
  friends: { name: 'Friends', emoji: '👥', color: 'from-blue-400 to-cyan-500', bg: 'bg-gradient-to-r from-blue-400 to-cyan-500' },
  work: { name: 'Work', emoji: '💼', color: 'from-green-400 to-emerald-500', bg: 'bg-gradient-to-r from-green-400 to-emerald-500' },
  hobby: { name: 'Hobby', emoji: '🎨', color: 'from-yellow-400 to-orange-500', bg: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
  fitness: { name: 'Fitness', emoji: '💪', color: 'from-red-400 to-pink-500', bg: 'bg-gradient-to-r from-red-400 to-pink-500' },
  study: { name: 'Study', emoji: '📚', color: 'from-indigo-400 to-purple-500', bg: 'bg-gradient-to-r from-indigo-400 to-purple-500' },
  default: { name: 'General', emoji: '🌟', color: 'from-gray-400 to-slate-500', bg: 'bg-gradient-to-r from-gray-400 to-slate-500' }
};

function GroupsPage() {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Modals state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  // Create Form states
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupTheme, setGroupTheme] = useState('default');
  const [inviteCode, setInviteCode] = useState('');
  
  // View Members states
  const [viewingMembersOf, setViewingMembersOf] = useState<Group | null>(null);
  const [memberProfiles, setMemberProfiles] = useState<{role: string, profile: UserProfile | null}[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Invite Friends states
  const [invitingTo, setInvitingTo] = useState<Group | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());

  // Loading states
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setMessage('Failed to load pods');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async () => {
    if (!groupName.trim() || !user?.uid) {
      setMessage('Please enter a pod name and make sure you are logged in.');
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      await createGroup(groupName.trim(), groupDescription.trim(), user.uid);
      setMessage(`🎉 Pod "${groupName}" created successfully!`);
      setGroupName("");
      setGroupDescription("");
      setGroupTheme('default');
      setShowCreateForm(false);
      fetchGroups();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating group:', error);
      setMessage(`Failed to create pod: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !user?.uid) {
      setMessage('Please enter an invite code and make sure you are logged in.');
      return;
    }

    setJoining(true);
    setMessage("");

    try {
      const result = await joinGroup(inviteCode.trim(), user.uid);
      setMessage(result.message);
      if (result.success) {
        setInviteCode("");
        setShowJoinForm(false);
        fetchGroups();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error joining group:', error);
      setMessage('Failed to join pod. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!user?.uid) return;
    if (confirm('Are you sure you want to delete this pod? This action cannot be undone.')) {
      try {
        const result = await deleteGroup(groupId, user.uid);
        setMessage(result.message);
        if (result.success) fetchGroups();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to delete pod. Please try again.');
      }
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!user?.uid) return;
    if (confirm('Are you sure you want to leave this pod?')) {
      try {
        const result = await leaveGroup(groupId, user.uid);
        setMessage(result.message);
        if (result.success) fetchGroups();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to leave pod. Please try again.');
      }
    }
  };

  const handleViewMembers = async (group: Group) => {
    setViewingMembersOf(group);
    setLoadingMembers(true);
    try {
      const members = await getGroupMembers(group.id);
      const profiles = await Promise.all(members.map(async (m) => {
        const profile = await getUserProfile(m.user_id);
        return { role: m.role, profile };
      }));
      setMemberProfiles(profiles);
    } catch (error) {
      console.error("Error fetching members", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenInvite = async (group: Group) => {
    if (!user?.uid) return;
    setInvitingTo(group);
    setLoadingFriends(true);
    setSentInvites(new Set());
    try {
      const friendsList = await getFriends(user.uid);
      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends", error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSendPodInvite = async (friend: UserProfile) => {
    if (!user?.uid || !invitingTo) return;
    try {
      await sendGroupInvitation(
        friend.uid,
        invitingTo.id,
        invitingTo.name,
        user.displayName || "A friend",
        invitingTo.invite_code
      );
      setSentInvites(prev => new Set(prev).add(friend.uid));
    } catch (error) {
      console.error("Error sending invite", error);
    }
  };

  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    setMessage(`Code ${inviteCode} copied to clipboard! 📋`);
    setTimeout(() => setMessage(''), 3000);
  };

  const getGroupTheme = (group: Group) => {
    const name = group.name.toLowerCase();
    const desc = group.description?.toLowerCase() || '';
    if (name.includes('family') || desc.includes('family')) return GROUP_THEMES.family;
    if (name.includes('friend') || desc.includes('friend')) return GROUP_THEMES.friends;
    if (name.includes('work') || desc.includes('work') || name.includes('office')) return GROUP_THEMES.work;
    if (name.includes('hobby') || desc.includes('hobby') || name.includes('art') || name.includes('music')) return GROUP_THEMES.hobby;
    if (name.includes('fitness') || desc.includes('fitness') || name.includes('gym') || name.includes('workout')) return GROUP_THEMES.fitness;
    if (name.includes('study') || desc.includes('study') || name.includes('school') || name.includes('class')) return GROUP_THEMES.study;
    return GROUP_THEMES.default;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">👥</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Pods</h1>
              <p className="text-xs text-gray-500">Connect and share happiness</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowJoinForm(true)}
              className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600 transition-colors"
            >
              Join
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm hover:shadow-md transition-all"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
        {message && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg transition-all">
            <p className="text-blue-800 text-sm font-medium">{message}</p>
          </div>
        )}

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loading loading-spinner loading-lg text-purple-500"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>              <h3 className="text-xl font-semibold text-gray-700 mb-2">No pods yet</h3>
              <p className="text-gray-500 mb-6">Create or join a pod to start sharing joy together!</p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Create Your First Pod
                </button>
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all"
                >
                  Join a Pod
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const theme = getGroupTheme(group);
                return (
                  <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
<div className="flex items-start space-x-3 flex-1">
                        <button 
                          onClick={() => router.push(`/groups/${group.id}`)}
                          className={`w-12 h-12 ${theme.bg} rounded-xl flex items-center justify-center text-white text-xl hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm`}
                        >
                          {theme.emoji}
                        </button>
                        <div className="flex-1">
                          <button 
                            onClick={() => router.push(`/groups/${group.id}`)}
                            className="font-semibold text-gray-800 mb-1 text-left hover:text-purple-600 transition-colors"
                          >
                            {group.name}
                          </button>
                          {group.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{group.description}</p>
                          )}
                           <div className="flex items-center space-x-4 text-xs text-gray-500">
                             <button onClick={() => handleViewMembers(group)} className="hover:text-purple-600 font-medium transition-colors">
                               👥 {group.member_count || 1} members
                             </button>
                             <span>📅 {group.created_at?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 text-right">
                         <button
                           onClick={() => router.push(`/groups/${group.id}`)}
                           className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-medium transition-colors mb-1"
                         >
                           📱 View Feed
                         </button>
                         <button
                           onClick={() => handleOpenInvite(group)}
                           className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                         >
                           📨 Invite Friend
                         </button>
                         <button
                           onClick={() => copyInviteCode(group.invite_code)}
                           className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                         >
                           📋 Copy Code
                         </button>
                         {group.created_by === user?.uid ? (
                          <button
                            onClick={() => handleDelete(group.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeave(group.id)}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                          >
                            👋 Leave
                          </button>
                        )}
                      </div>                   
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />

      {/* View Members Modal */}
      {viewingMembersOf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setViewingMembersOf(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pod Members</h2>
              <button onClick={() => setViewingMembersOf(null)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2">
              {loadingMembers ? (
                <div className="flex justify-center py-6">
                  <div className="loading loading-spinner text-purple-500"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberProfiles.map(({ profile, role }, i) => (
                    profile && (
                      <div key={i} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {profile.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{profile.displayName}</p>
                          <p className="text-xs text-gray-500">@{profile.username}</p>
                        </div>
                        {role === 'admin' && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends to Pod Modal */}
      {invitingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setInvitingTo(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Invite Friends</h2>
                <p className="text-xs text-gray-500">to {invitingTo.name}</p>
              </div>
              <button onClick={() => setInvitingTo(null)} className="text-gray-500 hover:text-gray-800 pb-4">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2">
              {loadingFriends ? (
                <div className="flex justify-center py-6">
                  <div className="loading loading-spinner text-purple-500"></div>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  You don&apos;t have any friends to invite yet!
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {friend.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{friend.displayName}</p>
                          <p className="text-xs text-gray-500">@{friend.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendPodInvite(friend)}
                        disabled={sentInvites.has(friend.uid)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          sentInvites.has(friend.uid) 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {sentInvites.has(friend.uid) ? 'Sent ✓' : 'Invite'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Pod Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create a Pod</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pod Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter pod name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="What&apos;s this pod about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pod Theme</label>
                <select
                  value={groupTheme}
                  onChange={(e) => setGroupTheme(e.target.value)}
                  className="select select-bordered w-full"
                >
                  {Object.entries(GROUP_THEMES).map(([key, theme]) => (
                    <option key={key} value={key}>
                      {theme.emoji} {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateForm(false)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="btn btn-primary flex-1">
                {creating ? <><div className="loading loading-spinner loading-sm"></div>Creating...</> : 'Create Pod'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Pod Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Join a Pod</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input input-bordered w-full font-mono text-center text-lg tracking-widest"
                  placeholder="XXXXXX"
                  maxLength={6}
                />
              </div>
              <p className="text-sm text-gray-600">Enter the 6-digit invite code provided by the pod creator.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowJoinForm(false)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={handleJoin} disabled={joining} className="btn btn-primary flex-1">
                {joining ? <><div className="loading loading-spinner loading-sm"></div>Joining...</> : 'Join Pod'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(GroupsPage);