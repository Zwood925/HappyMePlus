import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface JoySharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: { content: string; isPublic: boolean; imageFile?: File }) => void;
}

const JOY_PROMPTS = [
  "What made you smile today? 😊",
  "Share a moment of gratitude 🌱",
  "What's bringing you joy right now? ✨",
  "Tell us about a kind act you witnessed or did 💫"
];

export default function JoySharingModal({
  isOpen,
  onClose,
  onShare
}: JoySharingModalProps) {
  const { user } = useFirebaseAuth();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment'; // Use back camera on mobile
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.removeAttribute('capture'); // Allow gallery selection
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShare = async () => {
    if (!content.trim() || !user) return;

    setIsSharing(true);
    try {
      await onShare({
        content: content.trim(),
        isPublic,
        imageFile: selectedImage || undefined
      });
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error('Error sharing joy:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Joy Prompts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Need inspiration? 💡
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {JOY_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setContent(prompt)}
                      className="text-left p-2 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a Photo 📸
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCameraClick}
                    className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    📷 Camera
                  </button>
                  <button
                    onClick={handleGalleryClick}
                    className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    🖼️ Gallery
                  </button>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Joy Moment ✨
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what's bringing you joy today..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  maxLength={500}
                />
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Share with community</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={!content.trim() || isSharing}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSharing ? 'Sharing...' : 'Share Joy ✨'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
