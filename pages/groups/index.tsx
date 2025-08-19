import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { getUserGroups, createGroup, joinGroup, deleteGroup, leaveGroup, Group } from '../../lib/groups';
import { withAuth } from '../../lib/withAuth';

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

  const fetchGroups = async () => {
    if (!user?.uid) return;
    
    try {
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setMessage('Failed to load groups. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user?.uid]);

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-green-600"></div>
          <p className="mt-4 text-green-800 text-lg">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
              <p className="text-gray-600 mt-1">Connect and share happiness with your communities</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinForm(true)}
                className="btn btn-outline btn-primary"
              >
                Join Group
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`alert ${message.includes('successfully') || message.includes('copied') ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message}</span>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Groups Yet</h2>
            <p className="text-gray-600 mb-6">Start by creating your first group or joining an existing one!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary btn-lg"
              >
                Create Your First Group
              </button>
              <button
                onClick={() => setShowJoinForm(true)}
                className="btn btn-outline btn-lg"
              >
                Join a Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const theme = getGroupTheme(group);
              const isCreator = group.created_by === user?.uid;
              
              return (
                <div
                  key={group.id}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Group Header */}
                  <div className={`${theme.bg} rounded-t-xl p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
                      <div className="text-4xl">{theme.emoji}</div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{theme.emoji}</span>
                        <h3 className="text-xl font-bold">{group.name}</h3>
                      </div>
                      <p className="text-white/90 text-sm">{theme.name} Group</p>
                    </div>
                  </div>

                  {/* Group Content */}
                  <div className="p-6">
                    {group.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {group.member_count}
                        </div>
                        <span className="text-sm text-gray-600">
                          {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {isCreator && (
                        <span className="badge badge-primary badge-sm">Creator</span>
                      )}
                    </div>

                    {/* Invite Code */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Invite Code</p>
                          <p className="font-mono text-sm font-bold">{group.invite_code}</p>
                        </div>
                        <button
                          onClick={() => copyInviteLink(group.invite_code)}
                          className="btn btn-ghost btn-sm"
                          title="Copy invite link"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isCreator ? (
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="btn btn-error btn-sm flex-1"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLeave(group.id)}
                          className="btn btn-outline btn-sm flex-1"
                        >
                          Leave
                        </button>
                      )}
                      <button
                        onClick={() => copyInviteLink(group.invite_code)}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create a New Group</h2>
            
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
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
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
            <h2 className="text-2xl font-bold mb-4">Join a Group</h2>
            
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
    </div>
  );
}

export default withAuth(GroupsPage); 