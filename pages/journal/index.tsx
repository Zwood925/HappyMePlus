import { useState } from "react"
import { withAuth } from "../../lib/withAuth"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import Link from "next/link"
import { getRandomEncouragement } from "../../lib/getRandomEncouragement"

function JournalPage() {
  const supabase = useSupabaseClient()
  const user = useUser()

  const prompts = [
    "What challenged you today?",
    "Where did you find peace?",
    "What are you grateful for?",
    "What would you tell your younger self?",
    "How did you show kindness today?"
  ]

  const [selectedPrompt, setSelectedPrompt] = useState<string>("")
  const [mood, setMood] = useState("happy")
  const [entry, setEntry] = useState("")
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [encouragementMsg, setEncouragementMsg] = useState("")

  const handleSave = async () => {
    if (!entry.trim() || !user) return
    setSaving(true)

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      content: entry.trim(),
      prompt: selectedPrompt,
      mood
    })

    setSaving(false)

    if (error) {
      console.error("Error saving journal entry:", error.message)
    } else {
      setEntry("")
      setSelectedPrompt("")
      setMood("happy")
      setSuccessMsg("Entry saved successfully!")

      // 🎯 Show encouragement if sad or angry
      if (["sad", "angry"].includes(mood)) {
        const encouragement = await getRandomEncouragement(supabase)
        if (encouragement) {
          setEncouragementMsg(encouragement)
          setTimeout(() => setEncouragementMsg(""), 6000)
        }
      }

      setTimeout(() => setSuccessMsg(""), 3000)
    }
  }

  return (
    <>
      <h2>Let it out. This space is all yours.</h2>
      <p style={{ marginBottom: "1rem" }}>This is your private journal space.</p>

      <label>
        <strong>Prompt (optional):</strong>
        <select
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value)}
          style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem", width: "100%" }}
        >
          <option value="">-- Choose a prompt --</option>
          {prompts.map((prompt, index) => (
            <option key={index} value={prompt}>
              {prompt}
            </option>
          ))}
        </select>
      </label>

      <label>
        <strong>Mood:</strong>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        >
          <option value="happy">😊 Happy</option>
          <option value="neutral">😐 Neutral</option>
          <option value="sad">😢 Sad</option>
          <option value="angry">😠 Angry</option>
        </select>
      </label>

      <textarea
        placeholder="Write your thoughts here..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          padding: "1rem",
          marginTop: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #ccc"
        }}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "0.5rem"
        }}
      >
        {saving ? "Saving..." : "Save Entry"}
      </button>

      {successMsg && (
        <p style={{ color: "green", marginTop: "1rem" }}>{successMsg}</p>
      )}

      {encouragementMsg && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: "0.5rem",
          color: "#92400e",
          fontWeight: "bold",
          fontSize: "1.1rem",
          textAlign: "center"
        }}>
          {encouragementMsg}
        </div>
      )}

      <Link href="/journal/calendar">
        <button
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1.25rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer"
          }}
        >
          📅 View Past Entries
        </button>
      </Link>
    </>
  )
}

export default withAuth(JournalPage)
