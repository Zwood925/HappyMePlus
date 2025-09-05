import React, { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getTodaysPrompt, submitDailyPromptResponse, getUserResponseForToday, DailyPrompt as DailyPromptType, DailyPromptResponse } from '../lib/dailyPrompts';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import JoyCardGenerator from './JoyCardGenerator';
import CameraCapture from './CameraCapture';
import {
  DailyPromptHeader,
  DailyPromptResponseDisplay,
  DailyPromptForm,
  DailyPromptLoading,
  DailyPromptEmpty
} from './daily-prompt';

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
  const [loading, setLoading] = useState(true);
  const [showJoyCardGenerator, setShowJoyCardGenerator] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const loadTodaysPrompt = useCallback(async () => {
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
  }, [user?.uid]);

  useEffect(() => {
    loadTodaysPrompt();
  }, [loadTodaysPrompt]);

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
    setShowCamera(true);
  };

  const handlePhotoTaken = (file: File) => {
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Close camera modal
    setShowCamera(false);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
      onResponseSubmitted?.();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <DailyPromptLoading />;
  }

  if (!todaysPrompt) {
    return <DailyPromptEmpty />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 shadow-sm border border-yellow-100"
    >
      {/* Prompt Header */}
      <DailyPromptHeader promptText={todaysPrompt.text} />

      {/* User Response Section */}
      {userResponse ? (
        <DailyPromptResponseDisplay
          response={userResponse}
          onCreateJoyCard={() => setShowJoyCardGenerator(true)}
        />
      ) : (
        <DailyPromptForm
          response={response}
          isPublic={isPublic}
          isSubmitting={isSubmitting}
          selectedImage={selectedImage}
          imagePreview={imagePreview}
          onResponseChange={setResponse}
          onPublicChange={setIsPublic}
          onCameraClick={handleCameraClick}
          onGalleryClick={() => {}} // This will be handled by the form component
          onRemoveImage={removeImage}
          onImageSelect={handleImageSelect}
          onSubmit={handleSubmit}
        />
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

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoTaken={handlePhotoTaken}
        onError={(error) => {
          console.error('Camera error:', error);
        }}
      />
    </motion.div>
  );
}
