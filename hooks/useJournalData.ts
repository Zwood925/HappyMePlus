import { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format, startOfDay, endOfDay } from 'date-fns';

// Types for combined journal data
export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: 'happy' | 'sad' | 'neutral';
  created_at: Date;
  type: 'manual' | 'button';
  entryType: 'journal';
}

export interface HappyMoment {
  id: string;
  user_id: string;
  content: string;
  created_at: Date;
  entryType: 'happy_moment';
}

export type CombinedEntry = JournalEntry | HappyMoment;

export function useJournalData() {
  const { user } = useFirebaseAuth();
  const [entries, setEntries] = useState<CombinedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all entries for a user
  const loadEntries = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    
    try {
      const allEntries: CombinedEntry[] = [];

      // Fetch journal entries (simplified query)
      const journalRef = collection(db, 'journal_entries');
      const journalQuery = query(
        journalRef,
        where('user_id', '==', user.uid)
        // Removed orderBy to avoid index requirement
      );
      
      const journalSnapshot = await getDocs(journalQuery);
      journalSnapshot.forEach((doc) => {
        const data = doc.data();
        allEntries.push({
          id: doc.id,
          user_id: data.user_id,
          content: data.content,
          mood: data.mood || 'neutral',
          created_at: data.created_at?.toDate() || new Date(),
          type: data.type || 'manual',
          entryType: 'journal'
        } as JournalEntry);
      });

      // Fetch happy moments (simplified query)
      const happyMomentsRef = collection(db, 'happy_moments');
      const happyQuery = query(
        happyMomentsRef,
        where('userId', '==', user.uid)
        // Removed orderBy to avoid index requirement
      );
      
      const happySnapshot = await getDocs(happyQuery);
      happySnapshot.forEach((doc) => {
        const data = doc.data();
        allEntries.push({
          id: doc.id,
          user_id: data.userId,
          content: data.content,
          created_at: data.createdAt?.toDate() || new Date(),
          entryType: 'happy_moment'
        } as HappyMoment);
      });

      // Sort all entries by date (newest first) in memory
      allEntries.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading journal data:', error);
      setError('Failed to load journal data');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Get entries for a specific date
  const getEntriesForDate = useCallback((date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return entries.filter(entry => {
      const entryDate = entry.created_at;
      return entryDate >= start && entryDate <= end;
    });
  }, [entries]);

  // Load data when user changes
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