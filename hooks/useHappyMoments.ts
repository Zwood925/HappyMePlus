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
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const moments = await getRecentHappyMoments(user.uid, 5);
      setRecentMoments(moments);
    } catch (error) {
      console.error('Error loading recent moments:', error);
      setError('Failed to load recent moments. Please refresh the page.');
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
      setTotalCount(0);
    }
  }, [user?.uid]);

  // Add a new happy moment
  const addMoment = useCallback(async (content: string, groupIds?: string[], imageFile?: File) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    setSubmitting(true);
    setError(null);
    try {
      const momentId = await addHappyMoment(content, user.uid, groupIds);
      
      // Refresh the data
      await loadRecentMoments();
      await loadTotalCount();
      
      return momentId;
    } catch (error) {
      console.error('Error adding moment:', error);
      setError('Failed to add moment. Please try again.');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [user?.uid, loadRecentMoments, loadTotalCount]);

  // Load data when user changes
  useEffect(() => {
    if (user?.uid) {
      loadRecentMoments();
      loadTotalCount();
    } else {
      // Clear data when user logs out
      setRecentMoments([]);
      setAllMoments([]);
      setTotalCount(0);
      setLastDoc(null);
      setHasMore(true);
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
    loadRecentMoments,
    loadAllMoments,
    loadTotalCount,
  };
} 