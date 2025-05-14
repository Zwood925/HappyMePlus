import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEncouragements } from "../lib/useEncouragements";

type HappyMoment = {
  content: string;
  user_id: string;
  created_at?: string;
};

export default function Home() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [input, setInput] = useState("");
  const [myMoments, setMyMoments] = useState<string[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState(null);

  const {
    encouragements,
    unreadCount,
    loading,
    markAllAsRead,
    refetch,
  } = useEncouragements();
  const [inboxOpen, setInboxOpen] = useState(false);

  const toggleInbox = async () => {
    setInboxOpen((prev) => {
      const newOpenState = !prev;

      if (newOpenState && unreadCount > 0) {
        // Wait a bit to ensure they render before marking read
        setTimeout(() => {
          markAllAsRead(); // ✅ mark as read after showing
        }, 10000);
      }

      return newOpenState;
    });
  };

  const fetchMoments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("happy_moments")
      .select("content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyMoments(data.map((row) => row.content));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { error } = await supabase.from("happy_moments").insert([
      {
        content: input,
        user_id: user?.id,
        group_code: activeGroup?.id ?? null,
      },
    ]);

    if (!error) {
      setInput("");
      fetchMoments();
    }
  };

  useEffect(() => {
    fetchMoments();
  }, [user]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>What's making you happy today?</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button type="submit">Add Moment</button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        <h3>Your Happy Moments</h3>
        {myMoments.length === 0 ? (
          <p>No moments yet. Start writing!</p>
        ) : (
          <ul>
            {myMoments.map((moment, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                {moment}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔔 Encouragement Notification Icon */}
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1.5rem",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={toggleInbox}
      >
        <span style={{ fontSize: "1.5rem" }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              fontSize: "0.75rem",
              padding: "0.2rem 0.5rem",
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {/* 📬 Inbox Modal */}
      {inboxOpen && (
        <div
          style={{
            position: "fixed",
            top: "4rem",
            right: "1rem",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            zIndex: 999,
            width: "300px",
            maxHeight: "50vh",
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          <h4 style={{ marginTop: 0 }}>Your Encouragements</h4>
          {loading ? (
            <p>Loading...</p>
          ) : encouragements.length === 0 ? (
            <p>No new encouragements.</p>
          ) : (
            encouragements.map((enc) => (
              <div
                key={enc.id}
                style={{
                  backgroundColor: "#f0f8ff",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>{(enc as any).profiles?.nickname || "Someone"}:</strong>
                <br />
                {enc.message}
              </div>
            ))
          )}
          <button
            onClick={() => setInboxOpen(false)}
            style={{
              marginTop: "0.5rem",
              background: "#ccc",
              border: "none",
              padding: "0.3rem 0.6rem",
              borderRadius: "5px",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
