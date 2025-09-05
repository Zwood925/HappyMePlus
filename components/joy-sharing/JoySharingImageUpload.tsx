import React, { useRef } from 'react';

interface JoySharingImageUploadProps {
  onCameraClick: () => void;
  onGalleryClick: () => void;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function JoySharingImageUpload({
  onCameraClick,
  onGalleryClick,
  onImageSelect
}: JoySharingImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
        onChange={onImageSelect}
        className="hidden"
      />
    </div>
  );
}
