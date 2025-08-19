import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface JournalEntryData {
  user_id: string;
  content: string;
  mood: 'happy' | 'sad' | 'neutral' | 'angry' | 'love';
  prompt?: string;
  type: 'manual' | 'button';
  notify_groups?: boolean; // Whether to notify support groups
}

// Add a new journal entry
export async function addJournalEntry(data: JournalEntryData): Promise<string> {
  try {
    const journalRef = collection(db, 'journal_entries');
    const docRef = await addDoc(journalRef, {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding journal entry:', error);
    throw error;
  }
}

// Get journal entries for a user
export async function getJournalEntries(userId: string) {
  try {
    const journalRef = collection(db, 'journal_entries');
    const q = query(
      journalRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const entries: any[] = [];
    
    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return entries;
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
} 