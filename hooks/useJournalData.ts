import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { startOfDay, endOfDay } from 'date-fns';

export interface HappyMoment {
  id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

export function useJournalData() {
  const { user } = useFirebaseAuth();
  const [entries, setEntries] = useState<HappyMoment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    if (!user?.uid || !db) return;

    setLoading(true);
    setError(null);
    
    try {
      const allEntries: HappyMoment[] = [];

      const happyMomentsRef = collection(db, 'happy_moments');
      const happyQuery = query(
        happyMomentsRef,
        where('userId', '==', user.uid)
      );
      
      const happySnapshot = await getDocs(happyQuery);
      happySnapshot.forEach((doc) => {
        const data = doc.data();
        allEntries.push({
          id: doc.id,
          user_id: data.userId,
          content: data.content,
          created_at: data.createdAt ? new Date(data.createdAt) : new Date(),
        } as HappyMoment);
      });

      allEntries.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const getEntriesForDate = useCallback((date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return entries.filter(entry => {
      const entryDate = entry.created_at;
      return entryDate >= start && entryDate <= end;
    });
  }, [entries]);

  useEffect(() => {
    if (user?.uid) {
      loadEntries();
    } else {
      setEntries([]);
      setError(null);
    }
  }, [user?.uid, loadEntries]);

  return {
    entries,
    loading,
    error,
    loadEntries,
    getEntriesForDate,
  };
}