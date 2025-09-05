import React from 'react';
import Image from 'next/image';

interface JoySharingImagePreviewProps {
  imagePreview: string;
  onRemoveImage: () => void;
}

export default function JoySharingImagePreview({ 
  imagePreview, 
  onRemoveImage 
}: JoySharingImagePreviewProps) {
  return (
    <div className="relative mb-4">
      <Image
        src={imagePreview}
        alt="Selected image"
        width={400}
        height={300}
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
  );
}
