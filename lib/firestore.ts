import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  startAfter
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

// Add a new happy moment
export async function addHappyMoment(content: string, userId: string): Promise<string> {
  try {
    const momentData: Omit<HappyMoment, 'id'> = {
      content,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const collectionRef = collection(db, 'happy_moments');
    const docRef = await addDoc(collectionRef, momentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding happy moment:', error);
    throw error;
  }
}

// Get recent happy moments for a user
export async function getRecentHappyMoments(userId: string, limitCount: number = 5): Promise<HappyMomentWithId[]> {
  try {
    const collectionRef = collection(db, 'happy_moments');
    
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const moments: HappyMomentWithId[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as HappyMoment;
      moments.push({
        ...data,
        id: doc.id,
      });
    });
    
    return moments;
  } catch (error) {
    console.error('Error getting recent happy moments:', error);
    throw error;
  }
}

// Get all happy moments for a user with pagination
export async function getAllHappyMoments(
  userId: string, 
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ moments: HappyMomentWithId[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const collectionRef = collection(db, 'happy_moments');
    
    let q = query(
      collectionRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      q = query(
        collectionRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const moments: HappyMomentWithId[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as HappyMoment;
      moments.push({
        ...data,
        id: doc.id,
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    
    return {
      moments,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error getting all happy moments:', error);
    throw error;
  }
}

// Get count of happy moments for a user
export async function getHappyMomentsCount(userId: string): Promise<number> {
  try {
    const collectionRef = collection(db, 'happy_moments');
    const q = query(
      collectionRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting happy moments count:', error);
    throw error;
  }
} 