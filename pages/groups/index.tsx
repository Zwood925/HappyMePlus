import { useEffect, useState } from "react";
import { withAuth } from "../../lib/withAuth";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

function GroupsDashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [joinCode, setJoinCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");

  console.log("Rendering GroupsDashboard...");
  console.log("User:", user);

  useEffect(() => {
    if (user?.id) {
      console.log("Fetching groups for user:", user.id);
      fetchMyGroups();
    }
  }, [user]);

  const fetchMyGroups = async () => {
    const { data: memberships, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user?.id);

    console.log("Memberships:", memberships);
    if (memberError) console.error("Membership fetch error:", memberError);

    if (!memberships || memberships.length === 0) {
      setMyGroups([]);
      console.log("No memberships found.");
      return;
    }

    const groupIds = memberships.map((m) => m.group_id);

    const { data: groups, error: groupError } = await supabase
      .from("groups")
      .select("id, name, invite_code, created_by")
      .in("id", groupIds)
      .eq("archived", false);

    if (groupError) console.error("Group fetch error:", groupError);

    console.log("Fetched groups:", groups);
    setMyGroups(groups || []);

    const { data: allMembers } = await supabase
      .from("group_members")
      .select("group_id");

    if (allMembers) {
      const counts = allMembers.reduce(
        (acc: Record<string, number>, cur: { group_id: string }) => {
          acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
          return acc;
        },
        {}
      );
      setMemberCounts(counts);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;

    const { data: group, error: groupErr } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", joinCode.trim())
      .single();

    if (groupErr || !group) {
      setMessage("Group not found.");
      return;
    }

    const { error: joinErr } = await supabase.from("group_members").insert({
      user_id: user?.id,
      group_id: group.id,
    });

    if (joinErr) {
      setMessage("You’re already in this group.");
    } else {
      setMessage("Successfully joined the group!");
      setJoinCode("");
      fetchMyGroups();
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    const inviteCode = uuidv4().slice(0, 6).toUpperCase();

    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({
        name: groupName.trim(),
        invite_code: inviteCode,
        created_by: user?.id,
        archived: false,
      })
      .select()
      .single();

    if (error || !newGroup) {
      setMessage("Failed to create group.");
      return;
    }

    await supabase.from("group_members").insert({
      user_id: user?.id,
      group_id: newGroup.id,
    });

    setGroupName("");
    setMessage(`Group created! Share your invite code: ${inviteCode}`);
    fetchMyGroups();
  };

  const handleDelete = async (groupId: string) => {
    const confirmed = confirm("Are you sure you want to delete this group?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("groups")
      .update({ archived: true })
      .eq("id", groupId)
      .eq("created_by", user?.id);

    if (error) {
      setMessage("Failed to delete group.");
    } else {
      setMessage("Group deleted.");
      fetchMyGroups();
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6 text-base-content">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-green-800 drop-shadow">
        Your Groups
      </h2>


      {myGroups.length === 0 ? (
        <p className="text-center text-neutral-content mb-6">
          You’re not in any groups yet.
        </p>
      ) : (
        <div className="grid gap-6 mb-10 sm:grid-cols-2 md:grid-cols-3">
          {myGroups.map((group) => {
            console.log("Rendering group card:", group);
            return (
              <div
                key={group.id}
                className="card bg-white shadow-lg border border-green-200 transition-transform hover:scale-[1.02] hover:shadow-xl relative"
              >
                <div className="card-body">
                  <h3 className="card-title text-lg text-green-800">{group.name}</h3>
                  <p className="text-sm text-neutral-content">
                    Invite Code:{" "}
                    <span className="font-mono text-green-700">{group.invite_code}</span>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Members: {memberCounts[group.id] || 1}
                  </p>
                  <div className="card-actions justify-between items-center mt-4">
                    <Link href={`/groups/${group.id}`}>
                      <button className="btn btn-primary btn-sm">View Group Feed</button>
                    </Link>
                    {user?.id === group.created_by && (
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="btn btn-sm btn-outline btn-error"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join/Create group UI */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="card bg-green-100 shadow-md border border-green-300">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-2 text-green-800">Join a Group</h3>
            <input
              type="text"
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="input input-bordered w-full mb-3"
            />
            <button className="btn btn-success w-full" onClick={handleJoin}>
              Join
            </button>
          </div>
        </div>

        <div className="card bg-green-100 shadow-md border border-green-300">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-2 text-green-800">Create a Group</h3>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full mb-3"
            />
            <button className="btn btn-secondary w-full" onClick={handleCreate}>
              Create
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="alert alert-info shadow-lg mt-6">
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export default withAuth(GroupsDashboard);
