import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { ensureUserProfile } from './userProfiles';
import { getCurrentUser } from './firebaseAuth';

export const reportPost = async (postId: string, reportedUserId: string, reporterUserId: string, reason: string) => {
  try {
    await FirebaseFirestore.addDocument({
      reference: 'reports',
      data: {
        postId,
        reportedUserId,
        reporterUserId,
        reason,
        createdAt: new Date().toISOString(), // Native prefers standard ISO strings
        status: 'pending'
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error reporting post:', error);
    return { success: false, error };
  }
};

export const blockUser = async (currentUserId: string, blockedUserId: string) => {
  try {
    // Native plugin uses a direct string path for updates
    await FirebaseFirestore.updateDocument({
      reference: `users/${currentUserId}`,
      data: {
        // Native array union syntax
        blockedUsers: { __op: 'arrayUnion', elements: [blockedUserId] } 
      }
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
  createdAt: string; // Changed from Timestamp to string for native compatibility
  updatedAt: string;
}

export interface HappyMomentWithId extends HappyMoment {
  id: string;
}

export async function addHappyMoment(content: string, userId: string, groupIds?: string[], authorEmail?: string): Promise<string> {
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

    const { reference } = await FirebaseFirestore.addDocument({
      reference: 'happy_moments',
      data: momentData
    });
    
    // The native plugin returns the reference object which includes the generated ID
    const newId = reference.id; 
    console.log('Happy moment created natively:', newId);
    return newId;
  } catch (error) {
    console.error('Error adding happy moment:', error);
    throw error;
  }
}

export async function getRecentHappyMoments(userId: string, limitCount: number = 5): Promise<HappyMomentWithId[]> {
  try {
    const { snapshots } = await FirebaseFirestore.getCollection({
      reference: 'happy_moments',
      // 🚨 Filters (where) must go inside a compositeFilter wrapper natively
      compositeFilter: {
        type: 'and',
        queryConstraints: [
          { type: 'where', fieldPath: 'userId', opStr: '==', value: userId }
        ]
      },
      // 🚨 Actions (orderBy, limit) go in the queryConstraints natively
      queryConstraints: [
        { type: 'orderBy', fieldPath: 'createdAt', directionStr: 'desc' },
        { type: 'limit', limit: limitCount }
      ]
    });
    
    return snapshots.map(snap => ({
      ...snap.data,
      id: snap.id
    })) as HappyMomentWithId[];
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
    const nonFilters: any[] = [
      { type: 'orderBy', fieldPath: 'createdAt', directionStr: 'desc' },
      { type: 'limit', limit: pageSize }
    ];

    const { snapshots } = await FirebaseFirestore.getCollection({
      reference: 'happy_moments',
      compositeFilter: {
        type: 'and',
        queryConstraints: [
          { type: 'where', fieldPath: 'userId', opStr: '==', value: userId }
        ]
      },
      queryConstraints: nonFilters
    });
    
    const moments = snapshots.map(snap => ({
      ...snap.data,
      id: snap.id
    })) as HappyMomentWithId[];
    
    const lastVisible = snapshots.length > 0 ? snapshots[snapshots.length - 1].id : null;
    
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
    // 🚨 The native plugin has a dedicated count method to save on reads!
    const { count } = await FirebaseFirestore.getCountFromServer({
      reference: 'happy_moments',
      compositeFilter: {
        type: 'and',
        queryConstraints: [
          { type: 'where', fieldPath: 'userId', opStr: '==', value: userId }
        ]
      }
    });
    
    return count;
  } catch (error) {
    console.error('Error getting happy moments count:', error);
    throw error;
  }
}