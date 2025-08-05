import { useState, useEffect } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

interface Props {
  groupId: string;
}

export default function SendEncouragement({ groupId }: Props) {
  const { user } = useFirebaseAuth();

  const [members, setMembers] = useState<any[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!groupId || !user) return;

    // TODO: Replace with Firebase Firestore queries
    // const fetchMembers = async () => {
    //   const { data, error } = await supabase
    //     .from("group_members")
    //     .select("user_id, profiles(username)")
    //     .eq("group_id", groupId)
    //     .neq("user_id", user.id);

    //   if (error) {
    //     console.error("Error fetching members:", error);
    //   } else {
    //     setMembers(data);
    //   }
    // };

    // fetchMembers();
  }, [groupId, user]);

  const sendEncouragement = async () => {
    if (!recipientId || !message) return;

    // TODO: Replace with Firebase Firestore queries
    // const { error } = await supabase.from("direct_encouragements").insert([
    //   {
    //     sender_id: user?.id,
    //     recipient_id: recipientId,
    //     group_id: groupId,
    //     message,
    //   },
    // ]);

    // if (error) {
    //   console.error("Send error:", error);
    //   setStatus("Failed to send 😢");
    // } else {
    //   setStatus("Encouragement sent! ✅");
    //   setMessage("");
    //   setRecipientId("");
    // }
    
    setStatus("Feature coming soon! 🚧");
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-bold mb-2">Send Encouragement</h2>

      <select
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
        className="border p-2 mb-2 w-full"
      >
        <option value="">Select a group member</option>
        {members.map((m) => (
          <option key={m.user_id} value={m.user_id}>
            {m.profiles?.username || m.user_id}
          </option>
        ))}
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your encouragement..."
        className="border p-2 w-full h-24 mb-2"
      />

      <button
        onClick={sendEncouragement}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>

      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
