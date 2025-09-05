import React from 'react';

interface JoySharingHeaderProps {
  onClose: () => void;
}

export default function JoySharingHeader({ onClose }: JoySharingHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🌟</div>
          <h2 className="text-lg font-bold text-gray-800">Share Your Joy</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <span className="text-xl">×</span>
        </button>
      </div>
    </div>
  );
}
