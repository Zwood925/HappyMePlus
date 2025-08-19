import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useFirebaseAuth } from '../../../hooks/useFirebaseAuth';
import { getGroupByInviteCode, joinGroup, Group } from '../../../lib/groups';
import { withAuth } from '../../../lib/withAuth';

function JoinGroupPage() {
  const router = useRouter();
  const { inviteCode } = router.query;
  const { user } = useFirebaseAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (inviteCode && typeof inviteCode === 'string') {
      checkInviteCode(inviteCode);
    }
  }, [inviteCode]);

  const checkInviteCode = async (code: string) => {
    setLoading(true);
    try {
      const groupData = await getGroupByInviteCode(code);
      if (groupData) {
        setGroup(groupData);
        setMessage('');
      } else {
        setMessage('Invalid invite code. Please check the link and try again.');
      }
    } catch (error) {
      console.error('Error checking invite code:', error);
      setMessage('Failed to verify invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user?.uid || !group) return;

    setJoining(true);
    try {
      const result = await joinGroup(group.invite_code, user.uid);
      setMessage(result.message);
      
      if (result.success) {
        // Redirect to groups page after successful join
        setTimeout(() => {
          router.push('/groups');
        }, 2000);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setMessage('Failed to join group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-green-600"></div>
          <p className="mt-4 text-green-800">Verifying invite code...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="card bg-white shadow-lg max-w-md w-full">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="card-title text-2xl text-red-600 justify-center">Invalid Invite</h2>
            <p className="text-neutral-content mb-6">
              {message || 'This invite link is invalid or has expired.'}
            </p>
            <div className="card-actions justify-center">
              <button 
                onClick={() => router.push('/groups')}
                className="btn btn-primary"
              >
                Go to Groups
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="card bg-white shadow-lg max-w-md w-full">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="card-title text-2xl text-green-600 justify-center">Join Group</h2>
          
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-lg text-green-800 mb-2">{group.name}</h3>
            {group.description && (
              <p className="text-neutral-content text-sm mb-2">{group.description}</p>
            )}
            <p className="text-xs text-neutral-content">
              {group.member_count} member{group.member_count !== 1 ? 's' : ''}
            </p>
          </div>

          {message && (
            <div className={`alert ${message.includes('Successfully') ? 'alert-success' : 'alert-error'} mb-4`}>
              <span>{message}</span>
            </div>
          )}

          <div className="card-actions justify-center">
            {!message.includes('Successfully') && (
              <button 
                onClick={handleJoin}
                disabled={joining}
                className="btn btn-primary btn-lg"
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
            )}
            <button 
              onClick={() => router.push('/groups')}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(JoinGroupPage);
