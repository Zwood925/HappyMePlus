import { withAuth } from "../../lib/withAuth";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  members: Record<string, boolean>;
}

function GroupsDashboard() {
  const { user } = useFirebaseAuth();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const groupsRef = collection(db, 'groups');
      const q = query(
        groupsRef,
        where('members.' + user.uid, '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const groupsData: Group[] = [];
      
      querySnapshot.forEach((doc) => {
        groupsData.push({
          id: doc.id,
          ...doc.data()
        } as Group);
      });
      
      setMyGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      fetchGroups();
    }
  }, [user, fetchGroups]);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setMessage("Feature coming soon! 🚧");
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setMessage("Feature coming soon! 🚧");
  };

  const handleDelete = async (groupId: string) => {
    const confirmed = confirm("Are you sure you want to delete this group?");
    if (!confirmed) return;
    setMessage("Feature coming soon! 🚧");
  };

  return (
    <div className="min-h-screen bg-green-50 p-6 text-base-content">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-green-800 drop-shadow">
        Your Groups
      </h2>

      {loading ? (
        <p className="text-center text-neutral-content mb-6">Loading groups...</p>
      ) : myGroups.length === 0 ? (
        <p className="text-center text-neutral-content mb-6">
          You&apos;re not in any groups yet.
        </p>
      ) : (
        <div className="grid gap-6 mb-10 sm:grid-cols-2 md:grid-cols-3">
          {myGroups.map((group) => {
            return (
              <div
                key={group.id}
                className="card bg-white shadow-lg border border-green-200 transition-transform hover:scale-[1.02] hover:shadow-xl relative"
              >
                <div className="card-body">
                  <h3 className="card-title text-lg text-green-800">{group.name}</h3>
                  <p className="text-sm text-neutral-content">
                    Invite Code: <span className="font-mono">{group.invite_code}</span>
                  </p>
                  <p className="text-xs text-neutral-content">
                    {Object.keys(group.members).length} members
                  </p>
                  <div className="card-actions justify-end">
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-green-800">Join a Group</h3>
            <input
              type="text"
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="input input-bordered"
            />
            <button onClick={handleJoin} className="btn btn-primary">
              Join Group
            </button>
          </div>
        </div>

        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-green-800">Create a Group</h3>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered"
            />
            <button onClick={handleCreate} className="btn btn-secondary">
              Create Group
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="alert alert-info mt-6">
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export default withAuth(GroupsDashboard); 