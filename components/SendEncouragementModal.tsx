import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { getRandomEncouragement } from "../lib/getRandomEncouragement"; // ✅ import

interface Props {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SendEncouragementModal({ groupId, isOpen, onClose }: Props) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [members, setMembers] = useState<any[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [useRandom, setUseRandom] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!groupId || !user || !isOpen) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("user_id, profiles(nickname)")
        .eq("group_id", groupId);

      if (error) {
        console.error("Error loading members:", error);
      } else {
        console.log("Fetched group members:", data);
        setMembers(data);
      }
    };

    fetchMembers();
  }, [groupId, user, isOpen]);

  const handleSend = async () => {
    if (!recipientId) {
      setStatus("Please select a recipient.");
      return;
    }

    let messageToSend = customMessage;

    if (useRandom) {
      const random = await getRandomEncouragement(supabase);

      if (!random) {
        setStatus("Failed to fetch random message");
        return;
      }

      messageToSend = random;
    }

    if (!messageToSend.trim()) {
      setStatus("Message can&apos;t be empty.");
      return;
    }

    const { error } = await supabase.from("direct_encouragements").insert([
      {
        sender_id: user?.id,
        recipient_id: recipientId,
        group_id: groupId,
        message: messageToSend,
      },
    ]);

    if (error) {
      console.error(error);
      setStatus("Failed to send encouragement");
    } else {
      setStatus("Encouragement sent!");
      setCustomMessage("");
      setRecipientId("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Send Encouragement</h2>

        <select
          className="border p-2 w-full mb-2"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
        >
          <option value="">Choose group member</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.profiles?.nickname || m.user_id}
              {m.user_id === user?.id ? " (You)" : ""}
            </option>
          ))}
        </select>

        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={useRandom}
            onChange={(e) => setUseRandom(e.target.checked)}
            className="mr-2"
          />
          Use a random encouragement
        </label>

        {!useRandom && (
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="border p-2 w-full h-24 mb-2"
            placeholder="Write your own encouragement"
          />
        )}

        <div className="flex justify-between items-center">
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
            Send
          </button>
          <button onClick={onClose} className="text-sm text-gray-600 underline">
            Cancel
          </button>
        </div>

        {status && (
          <p
            className={`mt-2 text-sm ${
              status.toLowerCase().includes("fail") ? "text-red-500" : "text-green-600"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
