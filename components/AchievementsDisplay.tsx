import React from 'react';

interface AchievementsDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementsDisplay({ isOpen, onClose }: AchievementsDisplayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🏆 Achievements</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <p className="text-gray-600">Achievements system coming soon!</p>
      </div>
    </div>
  );
}
