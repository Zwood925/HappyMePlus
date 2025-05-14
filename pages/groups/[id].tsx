import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { withAuth } from "../../lib/withAuth";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
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
      fetchGroupFeed();
    }
  }, [id, user]);

  const fetchGroupInfo = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Group fetch error:", error.message);
    } else {
      setGroup(data);
    }
  };

  const fetchGroupFeed = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("happy_moments")
      .select("content, created_at, user_id")
      .eq("group_code", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Feed fetch error:", error.message);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(data.map((m) => m.user_id))];

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    const emailMap = Object.fromEntries(profileData?.map((p) => [p.id, p.email]) || []);

    const enriched = data.map((m) => ({
      ...m,
      email: emailMap[m.user_id] || "Unknown",
    }));

    setMoments(enriched);
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      {group && (
        <>
          <h2>{group.name} Group Feed</h2>
          <p><strong>Invite Code:</strong> {group.invite_code}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send Encouragement
          </button>
        </>
      )}

      {loading ? (
        <p>Loading feed...</p>
      ) : moments.length === 0 ? (
        <p>No happy moments posted yet.</p>
      ) : (
        <ul style={{ marginTop: "2rem" }}>
          {moments.map((moment, index) => (
            <li key={index} style={{ marginBottom: "1rem" }}>
              <strong>{moment.email?.split("@")[0]}:</strong><br />
              {moment.content}
              <br />
              <small style={{ color: "#999" }}>
                {new Date(moment.created_at).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      )}

      <SendEncouragementModal
        groupId={typeof id === "string" ? id : ""}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default withAuth(GroupFeedPage);
