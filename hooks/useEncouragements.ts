import { useEffect, useState } from "react";
import { useFirebaseAuth } from "./useFirebaseAuth";

interface Encouragement {
  id: string;
  message: string;
  created_at: string;
  read_at?: boolean;
  sender_name?: string;
}

export function useEncouragements() {
  const { user } = useFirebaseAuth();

  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEncouragements = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // TODO: Replace with Firebase Firestore queries
    // const { data, error } = await supabase
    //   .from("direct_encouragements")
    //   .select(`
    //     id,
    //     message,
    //     created_at,
    //     read,
    //     sender:sender_id (
    //       nickname
    //     )
    //   `)
    //   .eq("recipient_id", user.id)
    //   .eq("read", false)
    //   .order("created_at", { ascending: false });

    // if (error) {
    //   console.error("❌ Error fetching encouragements:", error.message);
    //   setError(error.message);
    //   setLoading(false);
    // } else {
    //   const formatted = (data || []).map((item: any) => ({
    //     id: item.id,
    //     message: item.message,
    //     created_at: item.created_at,
    //     read_at: item.read,
    //     sender_name: item.sender?.nickname || "A friend",
    //   }));

    //   setEncouragements(formatted);
    //   setLoading(false);
    // }

    // Temporary placeholder
    setEncouragements([]);
    setLoading(false);
  };

  const markAllAsRead = async () => {
    if (!user || encouragements.length === 0) return;

    // TODO: Replace with Firebase Firestore queries
    // const ids = encouragements.map((e) => e.id);

    // for (const id of ids) {
    //   const { error } = await supabase
    //     .from("direct_encouragements")
    //     .update({ read: true })
    //     .eq("id", id);

    //   if (error) {
    //     console.error("❌ Failed to mark read:", id, error.message);
    //   } else {
    //     console.log(`✅ Marked ${id} as read`);
    //   }
    // }

    // await fetchEncouragements();
  };

  useEffect(() => {
    fetchEncouragements();
  }, [user]);

  return {
    encouragements,
    unreadCount: encouragements.length,
    loading,
    error,
    markAllAsRead,
    refetch: fetchEncouragements,
  };
}
