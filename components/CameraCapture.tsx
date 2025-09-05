import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoTaken: (file: File) => void;
  onError?: (error: string) => void;
}

export default function CameraCapture({ 
  isOpen, 
  onClose, 
  onPhotoTaken, 
  onError 
}: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera permissions.'
        : err.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : 'Failed to start camera. Please try again.';
      
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, onError]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setCapturedImage(null);
  }, []);

  // Take photo
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        setError('Failed to get canvas context');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create file from blob
          const file = new File([blob], `photo_${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });

          // Create preview URL
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);

          // Call the callback with the file
          onPhotoTaken(file);
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      setError('Failed to capture photo');
      onError?.('Failed to capture photo');
    }
  }, [stream, onPhotoTaken, onError]);

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isOpen && stream) {
      startCamera();
    }
  }, [facingMode, isOpen, stream, startCamera]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Take Photo</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Camera View */}
            <div className="relative bg-black">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Starting camera...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm mb-2">{error}</p>
                    <button
                      onClick={startCamera}
                      className="bg-white text-black px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : capturedImage ? (
                <div className="relative">
                  <Image
                    src={capturedImage}
                    alt="Captured photo"
                    width={400}
                    height={256}
                    className="w-full h-64 object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-sm text-gray-800 mb-2">Photo captured!</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={retakePhoto}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Retake
                        </button>
                        <button
                          onClick={onClose}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Use Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : stream ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <button
                      onClick={switchCamera}
                      className="bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all"
                      title="Switch Camera"
                    >
                      🔄
                    </button>
                    
                    <button
                      onClick={takePhoto}
                      className="bg-white p-4 rounded-full hover:bg-gray-100 transition-all"
                      title="Take Photo"
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white"></div>
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all"
                      title="Cancel"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Hidden canvas for photo capture */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* Instructions */}
            {!capturedImage && !error && (
              <div className="p-4 bg-gray-50 text-center">
                <p className="text-sm text-gray-600">
                  Position your camera and tap the red button to take a photo
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
