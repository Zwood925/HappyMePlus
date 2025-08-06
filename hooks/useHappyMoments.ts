import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import {
  addHappyMoment,
  getRecentHappyMoments,
  getAllHappyMoments,
  getHappyMomentsCount,
  HappyMomentWithId
} from '../lib/firestore';

export function useHappyMoments() {
  const { user } = useFirebaseAuth();
  const [recentMoments, setRecentMoments] = useState<HappyMomentWithId[]>([]);
  const [allMoments, setAllMoments] = useState<HappyMomentWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load recent moments
  const loadRecentMoments = useCallback(async () => {
    if (!user?.uid) {
      console.log('No user UID available, skipping loadRecentMoments');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Loading recent moments for user:', user.uid);
      console.log('User object:', user);
      console.log('User auth state:', user.emailVerified, user.providerData);
      
      const moments = await getRecentHappyMoments(user.uid, 5);
      setRecentMoments(moments);
      console.log('Successfully loaded recent moments:', moments);
    } catch (error) {
      console.error('Error loading recent moments:', error);
      console.error('Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        fullError: error
      });
      
      // Set a more specific error message
      if ((error as any)?.code === 'permission-denied') {
        setError('Permission denied. Please check your authentication.');
      } else if ((error as any)?.code === 'unavailable') {
        setError('Firestore is temporarily unavailable. Please try again.');
      } else {
        setError('Failed to load recent moments. Please refresh the page.');
      }
      
      // Don't throw - just set empty array as fallback
      setRecentMoments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load all moments (for the full log page)
  const loadAllMoments = useCallback(async (reset: boolean = false) => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const result = await getAllHappyMoments(user.uid, 20, reset ? undefined : lastDoc);

      if (reset) {
        setAllMoments(result.moments);
      } else {
        setAllMoments(prev => [...prev, ...result.moments]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.moments.length === 20);
    } catch (error) {
      console.error('Error loading all moments:', error);
      setError('Failed to load moments');
      // Don't throw - just set empty array as fallback
      if (reset) {
        setAllMoments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid, lastDoc]);

  // Load total count
  const loadTotalCount = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const count = await getHappyMomentsCount(user.uid);
      setTotalCount(count);
    } catch (error) {
      console.error('Error loading total count:', error);
      setError('Failed to load count');
      // Don't throw - just set 0 as fallback
      setTotalCount(0);
    }
  }, [user?.uid]);

  // Add a new happy moment
  const addMoment = useCallback(async (content: string) => {
    if (!user?.uid || !content.trim()) return;

    setSubmitting(true);
    setError(null);
    
    // Create a timeout to ensure we don't hang indefinitely
    const timeoutId = setTimeout(() => {
      console.error('addMoment operation timed out after 10 seconds');
      setSubmitting(false);
      setError('Operation timed out. Please try again.');
    }, 10000);

    try {
      console.log('Adding moment for user:', user.uid, 'content:', content);
      const result = await addHappyMoment(content, user.uid);
      console.log('Successfully added moment to Firestore with ID:', result);

      // Clear the timeout since we succeeded
      clearTimeout(timeoutId);

      // Refresh the data - handle each operation separately to ensure errors don't block state reset
      try {
        console.log('Refreshing recent moments...');
        await loadRecentMoments();
        console.log('Successfully refreshed recent moments');
      } catch (refreshError) {
        console.error('Error refreshing recent moments:', refreshError);
        // Don't fail the entire operation if refresh fails
      }

      try {
        console.log('Refreshing total count...');
        await loadTotalCount();
        console.log('Successfully refreshed total count');
      } catch (refreshError) {
        console.error('Error refreshing total count:', refreshError);
        // Don't fail the entire operation if refresh fails
      }

      return true;
    } catch (error) {
      console.error('Error adding moment:', error);
      setError('Failed to add moment');
      return false;
    } finally {
      clearTimeout(timeoutId);
      console.log('Setting submitting to false');
      setSubmitting(false);
    }
  }, [user?.uid, loadRecentMoments, loadTotalCount]);

  // Load more moments (for pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadAllMoments();
  }, [hasMore, loading, loadAllMoments]);

  // Reset and load all moments (for the full log page)
  const resetAndLoadAll = useCallback(async () => {
    setAllMoments([]);
    setLastDoc(null);
    setHasMore(true);
    await loadAllMoments(true);
  }, [loadAllMoments]);

  // Initial load
  useEffect(() => {
    if (user?.uid) {
      console.log('User authenticated, starting to load data...');
      console.log('User UID:', user.uid);
      console.log('User email:', user.email);
      
      // Add a small delay to ensure authentication is fully established
      const timer = setTimeout(() => {
        console.log('Loading data after authentication delay...');
        loadRecentMoments();
        loadTotalCount();
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    } else {
      console.log('No user authenticated, clearing data...');
      setRecentMoments([]);
      setAllMoments([]);
      setTotalCount(0);
      setError(null);
    }
  }, [user?.uid, loadRecentMoments, loadTotalCount]);

  return {
    recentMoments,
    allMoments,
    loading,
    submitting,
    totalCount,
    hasMore,
    error,
    addMoment,
    loadMore,
    resetAndLoadAll,
    refreshRecent: loadRecentMoments,
  };
} 