import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const videos = [
  'praise.mp4',
  'dancing-cap.mp4',
  'fireworks.mp4',
  'confetti.mp4',
  'dancing-cowboy.mp4',
  'dancing-dino.mp4',
  'dancing-lady2.mp4',
  'dancing-lady.mp4',
  'dancing-silver.mp4',
  'dancing-baby.mp4'
];

export default function VideoCelebration({ isOpen, onClose }: VideoCelebrationProps) {
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      // Select a random video
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      setCurrentVideo(randomVideo);
      setIsPlaying(true);
      
      // Auto-close after 5 seconds
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [currentVideo, isPlaying]);

  const handleVideoEnd = () => {
    // If video ends before 5 seconds, close immediately
    onClose();
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-4xl w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video Container */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[80vh] object-contain"
              onEnded={handleVideoEnd}
              onError={(e) => {
                console.error('Video error:', e);
                onClose();
              }}
              muted
              playsInline
            >
              <source src={`/videos/${currentVideo}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </div>

          {/* Celebration Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-6"
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              🎉 You&apos;re Awesome! 🎉
            </h2>
            <p className="text-white text-lg opacity-90">
              Keep spreading that positive energy!
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 