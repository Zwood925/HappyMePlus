import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkUsernameAvailability, createUserProfile } from '../lib/community';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface UsernameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (username: string) => void;
  isOnboarding?: boolean;
}

export default function UsernameSetupModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  isOnboarding = false 
}: UsernameSetupModalProps) {
  const { user } = useFirebaseAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setDisplayName('');
      setIsAvailable(null);
      setError('');
    }
  }, [isOpen]);

  // Check username availability
  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const available = await checkUsernameAvailability(value);
      setIsAvailable(available);
      
      if (!available) {
        setError('Username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setError('Error checking username availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle username input with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid || !username.trim() || !displayName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!isAvailable) {
      setError('Please choose a different username');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create user profile with username
      await createUserProfile({
        uid: user.uid,
        username: username.toLowerCase(),
        displayName: displayName.trim(),
        email: user.email || '',
        avatarUrl: user.photoURL || undefined
      });

      onComplete(username.toLowerCase());
    } catch (error) {
      console.error('Error creating user profile:', error);
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUsernameStatus = () => {
    if (!username) return null;
    if (isChecking) return { text: 'Checking...', color: 'text-gray-500' };
    if (username.length < 3) return { text: 'Too short', color: 'text-red-500' };
    if (isAvailable === true) return { text: 'Available!', color: 'text-green-500' };
    if (isAvailable === false) return { text: 'Taken', color: 'text-red-500' };
    return null;
  };

  const status = getUsernameStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isOnboarding ? 'Welcome to HappyMe+!' : 'Choose Your Username'}
              </h2>
              <p className="text-gray-600">
                {isOnboarding 
                  ? 'Let\'s set up your profile to start sharing joy with the world!'
                  : 'Pick a unique username that represents you'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your real name or nickname"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={30}
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full p-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={20}
                  />
                  {status && (
                    <div className={`absolute right-3 top-3 text-sm ${status.color}`}>
                      {status.text}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only letters, numbers, and underscores. 3-20 characters.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!username.trim() || !displayName.trim() || isChecking || isAvailable !== true || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Profile...
                  </div>
                ) : (
                  isOnboarding ? 'Get Started ✨' : 'Save Username'
                )}
              </button>

              {/* Skip for non-onboarding */}
              {!isOnboarding && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 py-2"
                >
                  Skip for now
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
