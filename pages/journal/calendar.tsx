import { useEffect, useState } from "react"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css'
import { withAuth } from "../../lib/withAuth"

type JournalEntry = {
  id: string
  created_at: string
  content: string
  mood: string
}

function JournalCalendar() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, created_at, content, mood")
      .eq("user_id", user?.id)

    if (error) {
      console.error("Error fetching entries:", error.message)
    } else {
      setEntries(data)
    }
  }

  const getEntriesByDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.created_at)
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      )
    })
  }

  const moodColors: Record<string, string> = {
    happy: "gold",
    sad: "#3b82f6",
    angry: "crimson",
    neutral: "gray"
  }

  return (
    <>
      <h2>📅 Journal Calendar</h2>
      <p style={{ marginBottom: "1rem" }}>Click on a day to view your journal entries.</p>

      <Calendar
        onClickDay={(value) => setSelectedDate(value)}
        tileContent={({ date, view }) => {
          if (view === "month") {
            const dayEntries = getEntriesByDate(date)
            if (dayEntries.length > 0) {
              const mood = dayEntries[0].mood || "neutral"
              return (
                <div
                  style={{
                    height: "8px",
                    width: "8px",
                    borderRadius: "50%",
                    backgroundColor: moodColors[mood],
                    margin: "0 auto",
                    marginTop: "4px"
                  }}
                />
              )
            }
          }
          return null
        }}
      />

      <div style={{ marginTop: "2rem" }}>
        <h4>Mood Key:</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><span style={{ color: "gold" }}>●</span> Happy</li>
          <li><span style={{ color: "#3b82f6" }}>●</span> Sad</li>
          <li><span style={{ color: "crimson" }}>●</span> Angry</li>
          <li><span style={{ color: "gray" }}>●</span> Neutral</li>
        </ul>
      </div>

      {selectedDate && (
        <div style={{ marginTop: "2rem" }}>
          <h3>
            Entries for {selectedDate.toLocaleDateString()}:
          </h3>
          <ul style={{ padding: 0 }}>
            {getEntriesByDate(selectedDate).map((entry) => (
              <li
                key={entry.id}
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f9fafb",
                  borderLeft: `6px solid ${moodColors[entry.mood]}`,
                  borderRadius: "0.5rem"
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  Mood: <strong style={{ color: moodColors[entry.mood] }}>{entry.mood}</strong>
                </div>
                <div style={{ marginTop: "0.25rem" }}>{entry.content}</div>
              </li>
            ))}

            {getEntriesByDate(selectedDate).length === 0 && (
              <li>No entries for this day.</li>
            )}
          </ul>
        </div>
      )}
    </>
  )
}

export default withAuth(JournalCalendar)
