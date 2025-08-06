import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

export interface HappyMoment {
  id?: string;
  content: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HappyMomentWithId extends HappyMoment {
  id: string;
}

// Simplified: Add a new happy moment
export async function addHappyMomentSimple(content: string, userId: string): Promise<string> {
  try {
    console.log('Adding happy moment (simple) for user:', userId);
    
    const momentData: Omit<HappyMoment, 'id'> = {
      content,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const collectionRef = collection(db, 'happy_moments');
    const docRef = await addDoc(collectionRef, momentData);
    console.log('Successfully added document with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding happy moment (simple):', error);
    throw error;
  }
}

// Simplified: Get all happy moments for a user (no complex queries)
export async function getAllHappyMomentsSimple(userId: string): Promise<HappyMomentWithId[]> {
  try {
    console.log('Getting all happy moments (simple) for user:', userId);
    
    const collectionRef = collection(db, 'happy_moments');
    const querySnapshot = await getDocs(collectionRef);
    
    const allMoments: HappyMomentWithId[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as HappyMoment;
      // Filter by userId in memory instead of using where clause
      if (data.userId === userId) {
        allMoments.push({
          id: doc.id,
          ...data,
        });
      }
    });

    // Sort by creation date (newest first)
    const sortedMoments = allMoments.sort((a, b) => 
      b.createdAt.toMillis() - a.createdAt.toMillis()
    );

    console.log(`Found ${sortedMoments.length} moments for user ${userId}`);
    return sortedMoments;
  } catch (error) {
    console.error('Error getting all happy moments (simple):', error);
    throw error;
  }
}

// Simplified: Get recent happy moments (just take first 5 from all)
export async function getRecentHappyMomentsSimple(userId: string, limitCount: number = 5): Promise<HappyMomentWithId[]> {
  try {
    console.log('Getting recent happy moments (simple) for user:', userId);
    
    const allMoments = await getAllHappyMomentsSimple(userId);
    const recentMoments = allMoments.slice(0, limitCount);
    
    console.log(`Returning ${recentMoments.length} recent moments`);
    return recentMoments;
  } catch (error) {
    console.error('Error getting recent happy moments (simple):', error);
    throw error;
  }
}

// Simplified: Get total count
export async function getHappyMomentsCountSimple(userId: string): Promise<number> {
  try {
    console.log('Getting happy moments count (simple) for user:', userId);
    
    const allMoments = await getAllHappyMomentsSimple(userId);
    return allMoments.length;
  } catch (error) {
    console.error('Error getting happy moments count (simple):', error);
    throw error;
  }
} 