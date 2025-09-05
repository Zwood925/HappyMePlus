import React, { useRef } from 'react';
import Image from 'next/image';

interface DailyPromptImageUploadProps {
  selectedImage: File | null;
  imagePreview: string | null;
  onCameraClick: () => void;
  onGalleryClick: () => void;
  onRemoveImage: () => void;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DailyPromptImageUpload({
  selectedImage,
  imagePreview,
  onCameraClick,
  onGalleryClick,
  onRemoveImage,
  onImageSelect
}: DailyPromptImageUploadProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Add a Photo 📸
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCameraClick}
          className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          📷 Camera
        </button>
        <button
          type="button"
          onClick={handleGalleryClick}
          className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
        >
          🖼️ Gallery
        </button>
      </div>
      
      {/* Hidden file inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={onImageSelect}
        className="hidden"
      />

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mt-3">
          <Image
            src={imagePreview}
            alt="Preview"
            width={400}
            height={192}
            className="w-full h-48 object-cover rounded-lg"
            unoptimized
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
