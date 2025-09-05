import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getJournalEntries, JournalEntryData } from '../lib/journal';
import ImageViewer from './ImageViewer';

interface JournalHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JournalEntry extends JournalEntryData {
  id: string;
  created_at: any;
}

export default function JournalHistory({ isOpen, onClose }: JournalHistoryProps) {
  const { user } = useFirebaseAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const loadJournalHistory = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError('');

    try {
      const journalEntries = await getJournalEntries(user.uid);
      setEntries(journalEntries as JournalEntry[]);
    } catch (error) {
      console.error('Error loading journal history:', error);
      setError('Failed to load journal history');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadJournalHistory();
    }
  }, [isOpen, user?.uid, loadJournalHistory]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageViewer(true);
  };

  const formatDate = (date: any) => {
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: any) => {
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Journal History</h2>
                  <p className="text-gray-600 mt-1">Your journey of joy and happiness</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg text-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={loadJournalHistory}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No journal entries yet
                  </h3>
                  <p className="text-gray-600">
                    Start sharing your happy moments to see them here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      {/* Entry Content */}
                      <p className="text-gray-800 leading-relaxed mb-3">
                        {entry.content}
                      </p>

                      {/* Image */}
                      {entry.image_url && (
                        <div className="mb-3">
                          <img
                            src={entry.image_url}
                            alt="Journal entry"
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(entry.image_url!)}
                          />
                        </div>
                      )}

                      {/* Date and Time */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(entry.created_at)}</span>
                        <span>{formatTime(entry.created_at)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Image Viewer */}
          <ImageViewer
            isOpen={showImageViewer}
            onClose={() => setShowImageViewer(false)}
            imageUrl={selectedImage}
            alt="Journal entry"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
