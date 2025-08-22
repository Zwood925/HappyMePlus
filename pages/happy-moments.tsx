import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { withAuth } from '../lib/withAuth';
import { useHappyMoments } from '../hooks/useHappyMoments';
import BottomNavigation from '../components/BottomNavigation';

function HappyMomentsPage() {
  const { 
    allMoments, 
    loading, 
    totalCount, 
    hasMore, 
    loadAllMoments 
  } = useHappyMoments();

  useEffect(() => {
    loadAllMoments(true); // true to reset
  }, [loadAllMoments]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌟</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Happy Moments</h1>
              <p className="text-xs text-gray-500">{totalCount} moments of joy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
        <div className="p-4">
          {/* Moments List */}
          <div className="space-y-4">
            {allMoments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                    🌟
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed mb-2">
                      {moment.content}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>{formatDate(moment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="loading loading-spinner loading-lg text-purple-500"></div>
              <p className="text-gray-600 mt-4">Loading your happy moments...</p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center mt-6">
              <button
                onClick={() => loadAllMoments(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Load More Moments
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && allMoments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No happy moments yet</h3>
              <p className="text-gray-500">Start sharing your joy to see it here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}

export default withAuth(HappyMomentsPage); 