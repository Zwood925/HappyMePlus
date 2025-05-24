  import { useEffect, useState } from "react";
  import { withAuth } from "../../lib/withAuth";
  import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
  import { v4 as uuidv4 } from "uuid";
  import Link from "next/link";

  function GroupsDashboard() {
    const supabase = useSupabaseClient();
    const user = useUser();

    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [joinCode, setJoinCode] = useState("");
    const [groupName, setGroupName] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
      if (user) fetchMyGroups();
    }, [user]);

    const fetchMyGroups = async () => {
      const { data: memberships, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user?.id);

      console.log("🧪 fetched group_members for user", user?.id, memberships);
      if (memberError) console.error("❌ fetch group_members error:", memberError);

      if (memberError || !memberships || memberships.length === 0) {
        setMyGroups([]);
        return;
      }

      const groupIds = memberships.map((m) => m.group_id);

      const { data: groups, error: groupError } = await supabase
        .from("groups")
        .select("id, name, invite_code")
        .in("id", groupIds);

      console.log("📦 fetched groups:", groups);
      if (groupError) console.error("❌ fetch groups error:", groupError);

      if (groupError || !groups) {
        setMyGroups([]);
        return;
      }

      setMyGroups(groups);
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
        group_id: group.id
      });

      if (joinErr) {
        setMessage("You're already in this group.");
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
          created_by: user?.id
        })
        .select()
        .single();

      if (error || !newGroup) {
        setMessage("Failed to create group.");
        return;
      }

      await supabase.from("group_members").insert({
        user_id: user?.id,
        group_id: newGroup.id
      });

      setGroupName("");
      setMessage(`Group created! Share your invite code: ${inviteCode}`);
      fetchMyGroups();
    };

    return (
      <div style={{ padding: "2rem" }}>
        <h2>Your Groups</h2>

        {myGroups.length === 0 ? (
          <p>You’re not in any groups yet.</p>
        ) : (
          <ul style={{ marginBottom: "2rem" }}>
            {myGroups.map((group) => (
              <li key={group.id} style={{ marginTop: "0.75rem" }}>
                <strong>{group.name}</strong> (Invite Code: {group.invite_code}) &nbsp;
                <Link href={`/groups/${group.id}`}>
                  <button style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.4rem",
                    cursor: "pointer"
                  }}>
                    View Group Feed
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginBottom: "2rem" }}>
          <h3>Join a Group</h3>
          <input
            type="text"
            placeholder="Enter invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={{ padding: "0.5rem", marginRight: "0.5rem" }}
          />
          <button onClick={handleJoin}>Join</button>
        </div>

        <div>
          <h3>Create a Group</h3>
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ padding: "0.5rem", marginRight: "0.5rem" }}
          />
          <button onClick={handleCreate}>Create</button>
        </div>

        {message && (
          <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>
        )}
      </div>
    );
  }

  export default withAuth(GroupsDashboard);
