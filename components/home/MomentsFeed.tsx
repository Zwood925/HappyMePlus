import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HappyMomentWithId } from '../../lib/firestore';

interface MomentsFeedProps {
  moments: HappyMomentWithId[];
  loading: boolean;
  onCreatePostClick: () => void;
  onImageViewerOpen: (imageUrl: string) => void;
  userEmail?: string;
}

export default function MomentsFeed({
  moments,
  loading,
  onCreatePostClick,
  onImageViewerOpen,
  userEmail
}: MomentsFeedProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="loading loading-spinner loading-lg text-purple-500"></div>
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌟</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No happy moments yet</h3>
        <p className="text-gray-500 mb-6">Share your first moment of joy!</p>
        <button
          onClick={onCreatePostClick}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Share Joy
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {moments.map((moment) => (
        <motion.div
          key={moment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 leading-relaxed">{moment.content}</p>
              
              {/* Image Display */}
              {moment.imageUrl && (
                <div className="mt-3">
                  <Image
                    src={moment.imageUrl}
                    alt="Happy moment"
                    width={200}
                    height={120}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageViewerOpen(moment.imageUrl!)}
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                {moment.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
