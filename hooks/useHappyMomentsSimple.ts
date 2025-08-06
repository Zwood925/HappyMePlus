import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import {
  addHappyMomentSimple,
  getRecentHappyMomentsSimple,
  getAllHappyMomentsSimple,
  getHappyMomentsCountSimple,
  HappyMomentWithId
} from '../lib/firestore-simple';

export function useHappyMomentsSimple() {
  const { user } = useFirebaseAuth();
  const [recentMoments, setRecentMoments] = useState<HappyMomentWithId[]>([]);
  const [allMoments, setAllMoments] = useState<HappyMomentWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
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
      console.log('Loading recent moments (simple) for user:', user.uid);
      const moments = await getRecentHappyMomentsSimple(user.uid, 5);
      setRecentMoments(moments);
      console.log('Successfully loaded recent moments (simple):', moments);
    } catch (error) {
      console.error('Error loading recent moments (simple):', error);
      setError('Failed to load recent moments');
      setRecentMoments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load all moments
  const loadAllMoments = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const moments = await getAllHappyMomentsSimple(user.uid);
      setAllMoments(moments);
    } catch (error) {
      console.error('Error loading all moments (simple):', error);
      setError('Failed to load moments');
      setAllMoments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load total count
  const loadTotalCount = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const count = await getHappyMomentsCountSimple(user.uid);
      setTotalCount(count);
    } catch (error) {
      console.error('Error loading total count (simple):', error);
      setError('Failed to load count');
      setTotalCount(0);
    }
  }, [user?.uid]);

  // Add a new happy moment
  const addMoment = useCallback(async (content: string) => {
    if (!user?.uid || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      console.log('Adding moment (simple) for user:', user.uid, 'content:', content);
      const result = await addHappyMomentSimple(content, user.uid);
      console.log('Successfully added moment (simple) with ID:', result);

      // Refresh the data
      await loadRecentMoments();
      await loadTotalCount();

      return true;
    } catch (error) {
      console.error('Error adding moment (simple):', error);
      setError('Failed to add moment');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user?.uid, loadRecentMoments, loadTotalCount]);

  // Initial load
  useEffect(() => {
    if (user?.uid) {
      console.log('User authenticated, starting to load data (simple)...');
      
      // Add a small delay to ensure authentication is fully established
      const timer = setTimeout(() => {
        console.log('Loading data after authentication delay (simple)...');
        loadRecentMoments();
        loadTotalCount();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('No user authenticated, clearing data (simple)...');
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
    error,
    addMoment,
    refreshRecent: loadRecentMoments,
    loadAllMoments,
  };
} 