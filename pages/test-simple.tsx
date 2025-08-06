import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHappyMomentsSimple } from '../hooks/useHappyMomentsSimple';
import { withAuth } from '../lib/withAuth';

function TestSimplePage() {
  const {
    recentMoments,
    loading,
    submitting,
    totalCount,
    error,
    addMoment,
    refreshRecent
  } = useHappyMomentsSimple();

  const [newMoment, setNewMoment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMoment.trim()) return;

    const success = await addMoment(newMoment);
    if (success) {
      setNewMoment('');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-800 mb-4">
            Simple Happy Moments Test
          </h1>
          <p className="text-lg text-purple-600 mb-2">
            Testing simplified Firestore operations
          </p>
          <p className="text-sm text-purple-500">
            Total moments: {totalCount}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Add New Moment Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">Add Happy Moment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="moment" className="block text-sm font-medium text-purple-700 mb-2">
                What made you happy today?
              </label>
              <textarea
                id="moment"
                value={newMoment}
                onChange={(e) => setNewMoment(e.target.value)}
                placeholder="Share your happy moment..."
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newMoment.trim()}
              className="btn btn-primary btn-lg w-full"
            >
              {submitting ? 'Adding...' : 'Add Happy Moment'}
            </button>
          </form>
        </div>

        {/* Recent Moments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-800">Recent Happy Moments</h2>
            <button
              onClick={refreshRecent}
              disabled={loading}
              className="btn btn-outline btn-primary btn-sm"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="loading loading-lg loading-spinner text-purple-500"></div>
              <p className="text-purple-600 mt-4">Loading your happy moments...</p>
            </div>
          ) : recentMoments.length > 0 ? (
            <div className="space-y-4">
              {recentMoments.map((moment, index) => (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-sm">
                        🌟
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-800 font-medium leading-relaxed">
                        {moment.content}
                      </p>
                      <p className="text-sm text-purple-500 mt-2">
                        {formatDate(moment.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-purple-800 mb-2">
                No happy moments yet
              </h3>
              <p className="text-purple-600">
                Add your first happy moment above!
              </p>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <ul className="text-sm space-y-1">
            <li>• Loading: {loading ? 'Yes' : 'No'}</li>
            <li>• Submitting: {submitting ? 'Yes' : 'No'}</li>
            <li>• Total Count: {totalCount}</li>
            <li>• Recent Moments: {recentMoments.length}</li>
            <li>• Error: {error || 'None'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default withAuth(TestSimplePage); 