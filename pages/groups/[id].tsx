import { useRouter } from "next/router";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { useEffect, useState, useCallback } from "react";
import { withAuth } from "../../lib/withAuth";
import { db } from "../../lib/firebase";
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { Group } from "../../lib/groups";
import { HappyMomentWithId } from "../../lib/firestore";
import { getUserProfile } from "../../lib/community";
import BottomNavigation from "../../components/BottomNavigation";
import { motion } from "framer-motion";

function GroupFeedPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useFirebaseAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [moments, setMoments] = useState<(HappyMomentWithId & { userName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    
    setLoading(true);
    try {
      // 1. Fetch Pod Info
      const groupDoc = await getDoc(doc(db, 'groups', id));
      if (!groupDoc.exists()) {
        setError("Pod not found");
        setLoading(false);
        return;
      }
      setGroup({ id: groupDoc.id, ...groupDoc.data() } as Group);

      // 2. Fetch Happy Moments explicitly shared with this Pod
      const momentsQuery = query(
        collection(db, 'happy_moments'),
        where('groupIds', 'array-contains', id),
      );
      
      const snapshot = await getDocs(momentsQuery);
      
      // 3. Get User Profiles so we can show who posted it
      const momentsData = await Promise.all(snapshot.docs.map(async (momentDoc) => {
        const data = momentDoc.data();
        let userName = "A friend";
        try {
          const profile = await getUserProfile(data.userId);
          if (profile) userName = profile.displayName;
        } catch (e) {
          console.error(e);
        }
        
        return {
          id: momentDoc.id,
          content: data.content,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          userName
        } as (HappyMomentWithId & { userName: string });
      }));

      setMoments(momentsData);
} catch (err: any) {
      console.error('Error fetching pod data:', err);
      // 🚨 THIS PRINTS THE RAW FIREBASE ERROR TO THE SCREEN:
      setError(err.message || "Failed to load pod feed");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && user) {
      fetchData();
    }
  }, [id, user, fetchData]);

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={() => router.push('/groups')} 
            className="mr-3 p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50"
          >
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{group?.name || 'Loading Pod...'}</h1>
            <p className="text-xs text-gray-500 line-clamp-1">{group?.description || 'Shared happy moments'}</p>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="pt-20 pb-20 min-h-screen bg-gray-50 p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg text-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button onClick={() => router.push('/groups')} className="mt-4 text-purple-600 underline font-medium">
              Back to Pods
            </button>
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No moments yet</h3>
            <p className="text-gray-500">Be the first to share joy with this Pod!</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Share a Moment
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {moments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm">
                    {moment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-semibold text-gray-800 truncate pr-2">{moment.userName}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {moment.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed break-words">{moment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </>
  );
}

export default withAuth(GroupFeedPage);