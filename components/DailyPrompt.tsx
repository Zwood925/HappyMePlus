import React, { useState, useEffect, useRef } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getTodaysPrompt, submitDailyPromptResponse, getUserResponseForToday, DailyPrompt as DailyPromptType, DailyPromptResponse } from '../lib/dailyPrompts';
import { motion, AnimatePresence } from 'framer-motion';
import JoyCardGenerator from './JoyCardGenerator';

interface DailyPromptProps {
  onResponseSubmitted?: () => void;
}

export default function DailyPrompt({ onResponseSubmitted }: DailyPromptProps) {
  const { user } = useFirebaseAuth();
  const [todaysPrompt, setTodaysPrompt] = useState<DailyPromptType | null>(null);
  const [userResponse, setUserResponse] = useState<DailyPromptResponse | null>(null);
  const [response, setResponse] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showJoyCardGenerator, setShowJoyCardGenerator] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTodaysPrompt();
  }, [user?.uid]);

  const loadTodaysPrompt = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const prompt = await getTodaysPrompt();
      setTodaysPrompt(prompt);
      
      if (prompt) {
        const existingResponse = await getUserResponseForToday(user.uid, prompt.id);
        setUserResponse(existingResponse);
        if (existingResponse) {
          setResponse(existingResponse.response);
          setIsPublic(existingResponse.isPublic);
        }
      }
    } catch (error) {
      console.error('Error loading today\'s prompt:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !todaysPrompt || !response.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await submitDailyPromptResponse(user.uid, response.trim(), selectedImage || undefined, isPublic);
      setUserResponse({
        id: 'temp',
        userId: user.uid,
        promptId: todaysPrompt.id,
        promptText: todaysPrompt.text,
        response: response.trim(),
        createdAt: new Date() as any,
        isPublic
      });
      setSelectedImage(null);
      setImagePreview(null);
      setIsExpanded(false);
      onResponseSubmitted?.();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 shadow-sm border border-yellow-100"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-yellow-200 rounded w-3/4 mb-3"></div>
          <div className="h-6 bg-yellow-200 rounded w-1/2"></div>
        </div>
      </motion.div>
    );
  }

  if (!todaysPrompt) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 shadow-sm border border-blue-100"
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🌟</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No prompt today</h3>
          <p className="text-gray-600">Check back tomorrow for a new daily prompt!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 shadow-sm border border-yellow-100"
    >
      {/* Prompt Header */}
      <div className="flex items-center mb-4">
        <div className="text-3xl mr-3">✨</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daily Joy Prompt</h3>
          <p className="text-sm text-gray-600">Share what brings you joy today</p>
        </div>
      </div>

      {/* Prompt Text */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-lg text-gray-800 font-medium leading-relaxed">
          &ldquo;{todaysPrompt.text}&rdquo;
        </p>
      </div>

      {/* User Response Section */}
      {userResponse ? (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center mb-2">
            <div className="text-green-500 mr-2">✅</div>
            <span className="text-sm font-medium text-gray-700">Your response today:</span>
          </div>
          <p className="text-gray-800 leading-relaxed">{userResponse.response}</p>
          <div className="flex items-center justify-between mt-3">
            {userResponse.isPublic && (
              <div className="text-xs text-blue-600 flex items-center">
                <span className="mr-1">🌍</span>
                Shared on World Board
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoyCardGenerator(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              ✨ Create Joy Card
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a Photo 📸
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCameraClick}
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
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
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
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            <div>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
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

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  isPublic ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
                <span className="ml-3 text-sm text-gray-700">
                  Share on World Board
                </span>
              </label>
              <div className="text-xs text-gray-500">
                {isPublic ? '🌍 Public' : '👥 Friends only'}
              </div>
            </div>

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
      )}

      {/* Joy Card Generator Modal */}
      <AnimatePresence>
        {showJoyCardGenerator && userResponse && (
          <JoyCardGenerator
            response={userResponse}
            onClose={() => setShowJoyCardGenerator(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
