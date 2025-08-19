import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { withAuth } from '../lib/withAuth';
import { useHappyMoments } from '../hooks/useHappyMoments';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <button className="btn btn-ghost btn-sm">
              ← Back to Home
            </button>
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-800 mb-4">
            Your Happy Moments Journey
          </h1>
          
          <p className="text-lg text-purple-600 mb-2">
            {totalCount} moments of joy recorded
          </p>
          
          <p className="text-sm text-purple-500">
            Every moment counts! 🌟
          </p>
        </div>

        {/* Moments List */}
        <div className="space-y-4">
          {allMoments.map((moment, index) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-2xl">
                    🌟
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-purple-800 leading-relaxed mb-2">
                    {moment.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-purple-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      {formatDate(moment.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="loading loading-lg loading-spinner text-purple-500"></div>
            <p className="text-purple-600 mt-4">Loading your happy moments...</p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => loadAllMoments(false)}
              className="btn btn-primary btn-lg px-8"
            >
              Load More Moments
            </button>
          </div>
        )}

        {/* No More Moments */}
        {!hasMore && allMoments.length > 0 && (
          <div className="text-center mt-8 p-6 bg-purple-50 rounded-2xl">
            <p className="text-purple-600 text-lg">
              🎉 You've reached the end of your happy moments!
            </p>
            <p className="text-purple-500 mt-2">
              Keep adding more moments of joy to your collection.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && allMoments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              No happy moments yet
            </h2>
            <p className="text-purple-600 mb-6">
              Start your journey by adding your first happy moment!
            </p>
            <Link href="/">
              <button className="btn btn-primary btn-lg">
                Add Your First Moment
              </button>
            </Link>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <button className="btn btn-outline btn-primary">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HappyMomentsPage); 