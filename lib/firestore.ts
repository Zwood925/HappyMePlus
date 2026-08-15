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
  startAfter,
  getCountFromServer,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp

} from 'firebase/firestore';
import { ensureUserProfile } from './userProfiles';
import { getCurrentUser } from './firebaseAuth';

export const reportPost = async (postId: string, reportedUserId: string, reporterUserId: string, reason: string) => {
  try {
    await addDoc(collection(db, 'reports'), {
      postId,
      reportedUserId,
      reporterUserId,
      reason,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return { success: true };
  } catch (error) {
    console.error('Error reporting post:', error);
    return { success: false, error };
  }
};

export const blockUser = async (currentUserId: string, blockedUserId: string) => {
  try {
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
      blockedUsers: arrayUnion(blockedUserId)
    });
    return { success: true };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, error };
  }
};

export interface HappyMoment {
  id?: string;
  content: string;
  userId: string;
  authorEmail?: string;
  groupIds?: string[]; 
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HappyMomentWithId extends HappyMoment {
  id: string;
}

export async function addHappyMoment(content: string, userId: string, groupIds?: string[], authorEmail?: string): Promise<string> {
  try {
    const momentData: Omit<HappyMoment, 'id'> = {
      content,
      userId,
      authorEmail: authorEmail || 'Unknown',
      groupIds: groupIds || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const collectionRef = collection(db, 'happy_moments');
    const docRef = await addDoc(collectionRef, momentData);
    console.log('Happy moment created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding happy moment:', error);
    throw error;
  }
}

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

export async function getHappyMomentsCount(userId: string): Promise<number> {
  try {
    const collectionRef = collection(db, 'happy_moments');
    const q = query(
      collectionRef,
      where('userId', '==', userId)
    );
    
    // 🚨 THIS IS 1000x FASTER AND CHEAPER:
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
    
  } catch (error) {
    console.error('Error getting happy moments count:', error);
    throw error;
  }
}