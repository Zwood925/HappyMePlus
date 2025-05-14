import { useEffect, useState } from "react"
import { withAuth } from "../../lib/withAuth"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { v4 as uuidv4 } from "uuid"
import Link from "next/link"

function GroupsDashboard() {
  const supabase = useSupabaseClient()
  const user = useUser()

  const [myGroups, setMyGroups] = useState<any[]>([])
  const [joinCode, setJoinCode] = useState("")
  const [groupName, setGroupName] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user) fetchMyGroups()
  }, [user])

  const fetchMyGroups = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("groups(id, name, invite_code)")
      .eq("user_id", user?.id)

    if (error) {
      console.error("Fetch groups error:", error.message)
      return
    }

    const cleaned = data.map((entry) => entry.groups)
    setMyGroups(cleaned)
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return

    const { data: group, error: groupErr } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", joinCode.trim())
      .single()

    if (groupErr || !group) {
      setMessage("Group not found.")
      return
    }

    const { error: joinErr } = await supabase.from("group_members").insert({
      user_id: user?.id,
      group_id: group.id
    })

    if (joinErr) {
      setMessage("You're already in this group.")
    } else {
      setMessage("Joined group successfully!")
      setJoinCode("")
      fetchMyGroups()
    }
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return

    const inviteCode = uuidv4().slice(0, 6).toUpperCase()

    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({
        name: groupName.trim(),
        invite_code: inviteCode,
        created_by: user?.id
      })
      .select()
      .single()

    if (error || !newGroup) {
      setMessage("Failed to create group.")
      return
    }

    await supabase.from("group_members").insert({
      user_id: user?.id,
      group_id: newGroup.id
    })

    setGroupName("")
    setMessage(`Group created! Share your invite code: ${inviteCode}`)
    fetchMyGroups()
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Groups</h2>

      {myGroups.length === 0 ? (
        <p>You’re not in any groups yet.</p>
      ) : (
        <ul style={{ marginBottom: "2rem" }}>
          {myGroups.map((group) => (
            <li key={group.id} style={{ marginTop: "0.5rem" }}>
              <strong>{group.name}</strong> — Invite Code: {group.invite_code} &nbsp;
              <Link href={`/groups/${group.id}`}>
                <button style={{
                  padding: "0.25rem 0.75rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.4rem"
                }}>
                  View Feed
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
  )
}

export default withAuth(GroupsDashboard)
