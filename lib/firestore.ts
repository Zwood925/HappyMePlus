import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  arrayUnion, 
  getCountFromServer 
} from 'firebase/firestore';
import app from './firebase';

export const db = getFirestore(app);

export interface HappyMoment {
  id?: string;
  content: string;
  userId: string;
  authorEmail?: string;
  groupIds?: string[]; 
  createdAt: string;
  updatedAt: string;
}

export interface HappyMomentWithId extends HappyMoment {
  id: string;
}

export const reportPost = async (postId: string, reportedUserId: string, reporterUserId: string, reason: string) => {
  try {
    await addDoc(collection(db, 'reports'), {
      postId,
      reportedUserId,
      reporterUserId,
      reason,
      createdAt: new Date().toISOString(),
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

export async function addHappyMoment(
  content: string, 
  userId: string, 
  groupIds?: string[], 
  authorEmail?: string
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const momentData: Omit<HappyMoment, 'id'> = {
      content,
      userId,
      authorEmail: authorEmail || 'Unknown',
      groupIds: groupIds || [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'happy_moments'), momentData);
    console.log('Happy moment created via Web SDK:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding happy moment:', error);
    throw error;
  }
}

export async function getRecentHappyMoments(userId: string, limitCount: number = 5): Promise<HappyMomentWithId[]> {
  try {
    const q = query(
      collection(db, 'happy_moments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...(doc.data() as HappyMoment),
      id: doc.id
    }));
  } catch (error) {
    console.error('Error getting recent happy moments:', error);
    throw error;
  }
}

export async function getAllHappyMoments(
  userId: string, 
  pageSize: number = 20,
  lastDocId?: string 
): Promise<{ moments: HappyMomentWithId[], lastDocId: string | null }> {
  try {
    const q = query(
      collection(db, 'happy_moments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);
    const moments = snapshot.docs.map(doc => ({
      ...(doc.data() as HappyMoment),
      id: doc.id
    }));
    
    const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
    
    return {
      moments,
      lastDocId: lastVisible,
    };
  } catch (error) {
    console.error('Error getting all happy moments:', error);
    throw error;
  }
}

export async function getHappyMomentsCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, 'happy_moments'), where('userId', '==', userId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting happy moments count:', error);
    throw error;
  }
}