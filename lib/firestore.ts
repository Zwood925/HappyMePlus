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
    console.log('Adding happy moment for user:', userId);
    console.log('Firestore db object:', db);
    console.log('Firestore db type:', typeof db);
    console.log('Firestore db constructor:', db.constructor.name);

    const momentData: Omit<HappyMoment, 'id'> = {
      content,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Moment data to add:', momentData);

    // Test if we can access the collection
    const collectionRef = collection(db, 'happy_moments');
    console.log('Collection reference created:', collectionRef);

    console.log('About to call addDoc...');
    const docRef = await addDoc(collectionRef, momentData);
    console.log('Successfully added document with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding happy moment:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      fullError: error
    });
    
    // Check if it's a permissions error
    if ((error as any)?.code === 'permission-denied') {
      console.error('PERMISSION DENIED: Check your Firestore security rules');
    }
    
    // Check for other common errors
    if ((error as any)?.code === 'unavailable') {
      console.error('FIRESTORE UNAVAILABLE: Network or service issue');
    }
    
    if ((error as any)?.code === 'internal') {
      console.error('FIRESTORE INTERNAL ERROR: Service issue');
    }
    
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Get recent happy moments for a user
export async function getRecentHappyMoments(userId: string, limitCount: number = 5): Promise<HappyMomentWithId[]> {
  try {
    console.log('Getting recent happy moments for user:', userId);
    console.log('Firestore db object:', db);
    console.log('Firestore db type:', typeof db);
    console.log('Firestore db constructor:', db.constructor.name);
    
    // Test if we can access the collection
    const collectionRef = collection(db, 'happy_moments');
    console.log('Collection reference created:', collectionRef);
    
    // First, try a simple query without any filters to test basic connectivity
    console.log('Testing basic collection access...');
    const simpleQuery = query(collectionRef);
    const simpleSnapshot = await getDocs(simpleQuery);
    console.log('Basic query successful, total docs in collection:', simpleSnapshot.size);
    
    // Now try the filtered query
    console.log('Testing filtered query...');
    const q = query(
      collectionRef,
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc'), // Temporarily commented out
      // limit(limitCount) // Temporarily commented out
    );

    console.log('Query created:', q);
    
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot received, docs count:', querySnapshot.size);
    
    const moments: HappyMomentWithId[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as HappyMoment;
      moments.push({
        id: doc.id,
        ...data,
      });
    });

    // Sort in memory and limit
    const sortedMoments = moments
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limitCount);

    console.log('Processed moments:', sortedMoments);
    return sortedMoments;
  } catch (error) {
    console.error('Error getting recent happy moments:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      fullError: error
    });
    
    // Check if it's a permissions error
    if ((error as any)?.code === 'permission-denied') {
      console.error('PERMISSION DENIED: Check your Firestore security rules');
    }
    
    throw error;
  }
}

// Get all happy moments for a user (for pagination)
export async function getAllHappyMoments(
  userId: string, 
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ moments: HappyMomentWithId[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    // Temporarily remove orderBy to avoid composite index requirement
    let q = query(
      collection(db, 'happy_moments'),
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc'), // Temporarily commented out
      // limit(pageSize) // Temporarily commented out
    );

    // Note: startAfter won't work without orderBy, so we'll need to handle pagination differently
    // For now, just get all documents and handle pagination in memory
    if (lastDoc) {
      console.warn('Pagination with startAfter requires orderBy - using simple query for now');
    }

    const querySnapshot = await getDocs(q);
    const moments: HappyMomentWithId[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as HappyMoment;
      moments.push({
        id: doc.id,
        ...data,
      });
    });

    // Sort in memory
    const sortedMoments = moments.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    
    // Handle pagination in memory
    const startIndex = lastDoc ? sortedMoments.findIndex(m => m.id === lastDoc.id) + 1 : 0;
    const paginatedMoments = sortedMoments.slice(startIndex, startIndex + pageSize);
    
    const lastVisible = paginatedMoments.length > 0 ? 
      querySnapshot.docs.find(doc => doc.id === paginatedMoments[paginatedMoments.length - 1].id) || null : null;

    return {
      moments: paginatedMoments,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error getting all happy moments:', error);
    throw error;
  }
}

// Get total count of happy moments for a user
export async function getHappyMomentsCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'happy_moments'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting happy moments count:', error);
    throw error;
  }
} 