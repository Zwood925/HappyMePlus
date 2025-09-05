import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import {
  JoySharingHeader,
  JoyPrompts,
  JoySharingImageUpload,
  JoySharingImagePreview,
  JoySharingFooter
} from './joy-sharing';

interface JoySharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: { content: string; isPublic: boolean; imageFile?: File }) => void;
}

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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
            <JoySharingHeader onClose={onClose} />

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Joy Prompts */}
              <JoyPrompts onPromptSelect={setContent} />

              {/* Photo Upload */}
              <JoySharingImageUpload
                onCameraClick={() => {}} // This will be handled by the component
                onGalleryClick={() => {}} // This will be handled by the component
                onImageSelect={handleImageSelect}
              />

              {/* Image Preview */}
              {imagePreview && (
                <JoySharingImagePreview
                  imagePreview={imagePreview}
                  onRemoveImage={removeImage}
                />
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
            <JoySharingFooter
              onClose={onClose}
              onShare={handleShare}
              isSharing={isSharing}
              canShare={!!content.trim()}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
