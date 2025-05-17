import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { withAuth } from "../../lib/withAuth";
import SendEncouragementModal from "../../components/SendEncouragementModal";

function GroupFeedPage() {
  const router = useRouter();
  const { id } = router.query;

  const supabase = useSupabaseClient();
  const user = useUser();

  const [group, setGroup] = useState<any>(null);
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchGroupInfo();
      fetchGroupMoments();
    }
  }, [id, user]);

  const fetchGroupInfo = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setGroup(data);
    } else {
      console.error("Error fetching group info:", error);
    }
  };

  const fetchGroupMoments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("group_moments")
      .select("moment:moment_id(content, created_at, user_id)")
      .eq("group_id", id);

    console.log("Group feed returned data:", data);
    console.error("Group feed errors:", error);

    if (error) {
      setMoments([]);
    } else {
      setMoments(
        (data || [])
          .map((item: any) => ({
            ...item.moment,
            id: item.moment_id,
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );

    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Group Feed: {group?.name}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : moments.length === 0 ? (
        <p>No happy moments yet in this group.</p>
      ) : (
        <ul>
          {moments.map((moment) => (
            <li key={moment.id} style={{ marginBottom: "1rem" }}>
              <p>{moment.content}</p>
              <small>{new Date(moment.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => setShowModal(true)}>Send Encouragement</button>
      <SendEncouragementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        groupId={id as string}
      />
    </div>
  );
}

export default withAuth(GroupFeedPage);
