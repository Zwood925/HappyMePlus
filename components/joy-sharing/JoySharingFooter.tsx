import React from 'react';

interface JoySharingFooterProps {
  onClose: () => void;
  onShare: () => void;
  isSharing: boolean;
  canShare: boolean;
}

export default function JoySharingFooter({ 
  onClose, 
  onShare, 
  isSharing, 
  canShare 
}: JoySharingFooterProps) {
  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onShare}
          disabled={!canShare || isSharing}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isSharing ? 'Sharing...' : 'Share Joy ✨'}
        </button>
      </div>
    </div>
  );
}
