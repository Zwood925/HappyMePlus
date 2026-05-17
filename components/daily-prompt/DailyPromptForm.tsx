import React from 'react';
import { motion } from 'framer-motion';
import DailyPromptImageUpload from './DailyPromptImageUpload';

interface DailyPromptFormProps {
  response: string;
  isSubmitting: boolean;
  selectedImage: File | null;
  imagePreview: string | null;
  onResponseChange: (value: string) => void;
  onCameraClick: () => void;
  onGalleryClick: () => void;
  onRemoveImage: () => void;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function DailyPromptForm({
  response,
  isSubmitting,
  selectedImage,
  imagePreview,
  onResponseChange,
  onCameraClick,
  onGalleryClick,
  onRemoveImage,
  onImageSelect,
  onSubmit
}: DailyPromptFormProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Photo Upload */}
        <DailyPromptImageUpload
          selectedImage={selectedImage}
          imagePreview={imagePreview}
          onCameraClick={onCameraClick}
          onGalleryClick={onGalleryClick}
          onRemoveImage={onRemoveImage}
          onImageSelect={onImageSelect}
        />

        {/* Response Textarea */}
        <div>
          <textarea
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
            placeholder="Share what made you smile today..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all duration-200"
            rows={3}
            maxLength={500}
          />
          <div className="text-right mt-1">
            <span className="text-xs text-gray-500">
              {response.length}/500
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!response.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sharing...
            </span>
          ) : (
            'Share My Joy ✨'
          )}
        </button>
      </form>
    </motion.div>
  );
}
