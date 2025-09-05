import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { getUserGroups, createGroup, joinGroup, deleteGroup, leaveGroup, Group } from '../../lib/groups';
import { withAuth } from '../../lib/withAuth';
import BottomNavigation from '../../components/BottomNavigation';

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
  const { user } = useFirebaseAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupTheme, setGroupTheme] = useState('default');
  const [inviteCode, setInviteCode] = useState('');
  
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
      setMessage('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async () => {
    if (!groupName.trim() || !user?.uid) {
      setMessage('Please enter a group name and make sure you are logged in.');
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      await createGroup(groupName.trim(), groupDescription.trim(), user.uid);
      setMessage(`🎉 Group "${groupName}" created successfully!`);
      setGroupName("");
      setGroupDescription("");
      setGroupTheme('default');
      setShowCreateForm(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      setMessage(`Failed to create group: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    } catch (error) {
      console.error('Error joining group:', error);
      setMessage('Failed to join group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!user?.uid) return;

    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        const result = await deleteGroup(groupId, user.uid);
        setMessage(result.message);
        if (result.success) {
          fetchGroups();
        }
      } catch (error) {
        console.error('Error deleting group:', error);
        setMessage('Failed to delete group. Please try again.');
      }
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!user?.uid) return;

    if (confirm('Are you sure you want to leave this group?')) {
      try {
        const result = await leaveGroup(groupId, user.uid);
        setMessage(result.message);
        if (result.success) {
          fetchGroups();
        }
      } catch (error) {
        console.error('Error leaving group:', error);
        setMessage('Failed to leave group. Please try again.');
      }
    }
  };

  const getGroupTheme = (group: Group) => {
    // Simple theme detection based on group name/description
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

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/groups/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    setMessage('Invite link copied to clipboard! 📋');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-purple-500"></div>
          <p className="mt-4 text-gray-600">Loading your groups...</p>
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
            <div className="text-2xl">👥</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Groups</h1>
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

      {/* Main Content */}
      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
        {/* Message */}
        {message && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Groups */}
        <div className="p-4">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No groups yet</h3>
              <p className="text-gray-500 mb-6">Create or join a group to start sharing joy together!</p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Create Your First Group
                </button>
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all"
                >
                  Join a Group
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
                        <div className={`w-12 h-12 ${theme.bg} rounded-xl flex items-center justify-center text-white text-xl`}>
                          {theme.emoji}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{group.name}</h3>
                          {group.description && (
                            <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                          )}
                                                     <div className="flex items-center space-x-4 text-xs text-gray-500">
                             <span>👥 {group.member_count || 1} members</span>
                             <span>📅 {group.created_at?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                                                 <button
                           onClick={() => copyInviteLink(group.invite_code)}
                           className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                         >
                           📋 Copy Invite
                         </button>
                         {group.created_by === user?.uid ? (
                          <button
                            onClick={() => handleDelete(group.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeave(group.id)}
                            className="text-xs text-gray-600 hover:text-gray-700 font-medium"
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

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Create Group Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create a Group</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter group name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="What's this group about?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Group Theme</label>
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
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn btn-primary flex-1"
              >
                {creating ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Join a Group</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input input-bordered w-full font-mono text-center text-lg"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              
              <p className="text-sm text-gray-600">
                Enter the 6-digit invite code provided by the group creator.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowJoinForm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={joining}
                className="btn btn-primary flex-1"
              >
                {joining ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Joining...
                  </>
                ) : (
                  'Join Group'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(GroupsPage); 