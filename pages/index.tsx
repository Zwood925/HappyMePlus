import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEncouragements } from "../lib/useEncouragements";

export default function Home() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [input, setInput] = useState("");
  const [myMoments, setMyMoments] = useState<string[]>([]);

  const {
    encouragements,
    unreadCount,
    loading,
    markAllAsRead,
  } = useEncouragements();
  const [inboxOpen, setInboxOpen] = useState(false);

  const [isPartyTime, setIsPartyTime] = useState(false);
  const [emojis, setEmojis] = useState<string[]>([]);
  const [partyPhrase, setPartyPhrase] = useState('');

  const toggleInbox = () => {
    setInboxOpen((prev) => {
      const newOpenState = !prev;
      if (newOpenState && unreadCount > 0) {
        setTimeout(() => markAllAsRead(), 10000);
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

    const { data: momentData, error: insertError } = await supabase
      .from("happy_moments")
      .insert([{ content: input, user_id: user?.id }])
      .select("id")
      .single();

    if (insertError || !momentData?.id) {
      console.error("Error inserting moment:", insertError);
      return;
    }

    const momentId = momentData.id;

    const { data: groupMemberships, error: groupError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user?.id);

    if (groupError || !groupMemberships) {
      console.error("Error getting group memberships:", groupError);
      return;
    }

    const linkInserts = groupMemberships.map((group) => ({
      group_id: group.group_id,
      moment_id: momentId,
    }));

    const { error: linkError } = await supabase
      .from("group_moments")
      .insert(linkInserts);

    if (linkError) {
      console.error("Error inserting into group_moments:", linkError);
    }

    setInput("");
    fetchMoments();
  };

  useEffect(() => {
    if (user) {
      fetchMoments();
    }
  }, [user]);

  const handleHappyParty = () => {
    setIsPartyTime(true);
    const phrases = [
      "Party Time!",
      "Feeling Groovy!",
      "Happiness Activated!",
      "Woohoo! It's a Good Day!",
    ];
    setPartyPhrase(phrases[Math.floor(Math.random() * phrases.length)]);

    const emojiInterval = setInterval(() => {
      setEmojis((prev) => [
        ...prev,
        String.fromCodePoint(0x1f600 + Math.floor(Math.random() * 20)),
      ]);
    }, 500);

    setTimeout(() => {
      clearInterval(emojiInterval);
      setIsPartyTime(false);
      setEmojis([]);
      setPartyPhrase('');
    }, 3000);
  };

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

      <button
        onClick={handleHappyParty}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "15px 32px",
          fontSize: "16px",
          margin: "20px 0",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        I Feel Good!
      </button>

      {isPartyTime && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: '1rem' }}>{partyPhrase}</p>
          <div style={{ fontSize: "3rem", animation: 'fall 3s linear' }}>
            {emojis.map((emoji, index) => (
              <span key={index}>{emoji}</span>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
