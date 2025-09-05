import { useRouter } from "next/router";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { useEffect, useState, useCallback } from "react";
import { withAuth } from "../../lib/withAuth";
import SendEncouragementModal from "../../components/SendEncouragementModal";
import { motion } from "framer-motion";
import React from "react";

function GroupFeedPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useFirebaseAuth();

  const [group, setGroup] = useState<any>(null);
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchGroupInfo = useCallback(async () => {
    if (!id) return;
    
    try {
      // For now, create a simple group object
      // TODO: Implement proper group fetching from Firebase
      setGroup({ 
        id, 
        name: "Sample Group", 
        description: "A sample group for testing",
        invite_code: "ABC123",
        created_by: "user123",
        created_at: new Date(),
        updated_at: new Date(),
        members: {},
        member_count: 1
      });
    } catch (error) {
      console.error('Error fetching group info:', error);
    }
  }, [id]);

  const fetchGroupMoments = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // TODO: Implement getGroupMoments function
      // const groupMoments = await getGroupMoments(id);
      // setMoments(
      //   groupMoments
      //     .map((item: any) => ({
      //       ...item.moment,
      //       id: item.moment_id,
      //       nickname: item.moment?.profiles?.nickname || "Unknown",
      //     }))
      //     .sort(
      //       (a, b) =>
      //         new Date(b.created_at).getTime() -
      //         new Date(a.created_at).getTime()
      //     )
      //   );
      // }

      // Temporary placeholder
      setMoments([]);
    } catch (error) {
      console.error('Error fetching group moments:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && user) {
      fetchGroupInfo();
      fetchGroupMoments();
    }
  }, [id, user, fetchGroupInfo, fetchGroupMoments]);

  return (
    <div className="min-h-screen bg-green-50 p-6 text-base-content">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-extrabold text-green-800 drop-shadow mb-2">
          Group Feed
        </h2>
        <p className="text-lg font-semibold text-green-600">{group?.name}</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center text-lg text-neutral-content">
          Loading...
        </div>
      ) : moments.length === 0 ? (
        <div className="text-center text-neutral-content text-md italic">
          No happy moments yet in this group.
        </div>
      ) : (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {moments.map((moment) => (
            <motion.li
              key={moment.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card bg-yellow-100 shadow-lg rounded-xl p-4">
                <p className="text-green-900 text-md font-medium">
                  {moment.content}
                </p>
                <p className="text-sm text-neutral-content mt-1">
                  Posted by{" "}
                  <span className="font-semibold text-green-700">
                    {moment.nickname}
                  </span>
                </p>
                <p className="text-sm text-neutral-content">
                  {new Date(moment.created_at).toLocaleString()}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-success btn-wide shadow-md hover:scale-[1.03] transition-transform"
        >
          ✉️ Send Encouragement
        </button>
      </div>

      <SendEncouragementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        groupId={id as string}
      />
    </div>
  );
}

export default withAuth(GroupFeedPage);
