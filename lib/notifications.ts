import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';

export interface Notification {
  id?: string;
  user_id: string;
  type: 'group_invite' | 'support_request' | 'encouragement' | 'group_activity' | 'system';
  title: string;
  message: string;
  data?: {
    group_id?: string;
    group_name?: string;
    sender_id?: string;
    sender_name?: string;
    invite_code?: string;
    action_url?: string;
  };
  read: boolean;
  created_at: any;
  expires_at?: any;
}

export interface SupportRequest {
  id?: string;
  user_id: string;
  user_name: string;
  group_id: string;
  group_name: string;
  mood: 'sad' | 'angry' | 'down';
  message?: string;
  created_at: any;
  responded_to: boolean;
}

// Create a notification
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Get user's notifications
export async function getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Create support request notification for group members
export async function notifyGroupOfSupportRequest(
  userId: string,
  userName: string,
  groupId: string,
  groupName: string,
  mood: 'sad' | 'angry' | 'down',
  message?: string
): Promise<void> {
  try {
    // Get all group members except the user requesting support
    const groupMembersQuery = query(
      collection(db, 'group_members'),
      where('group_id', '==', groupId),
      where('user_id', '!=', userId)
    );
    
    const groupMembersSnapshot = await getDocs(groupMembersQuery);
    
    // Create notifications for each group member
    const notificationPromises = groupMembersSnapshot.docs.map(memberDoc => {
      const memberId = memberDoc.data().user_id;
      
      return createNotification({
        user_id: memberId,
        type: 'support_request',
        title: `${userName} is having a rough day`,
        message: `${userName} is feeling ${mood} and could use some support. Want to send them a nice note?`,
        data: {
          group_id: groupId,
          group_name: groupName,
          sender_id: userId,
          sender_name: userName,
          action_url: `/groups/${groupId}/support/${userId}`
        },
        read: false
      });
    });
    
    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error notifying group of support request:', error);
    throw error;
  }
}

// Send group invitation to user's inbox
export async function sendGroupInvitation(
  recipientUserId: string,
  groupId: string,
  groupName: string,
  inviterName: string,
  inviteCode: string
): Promise<string> {
  try {
    return await createNotification({
      user_id: recipientUserId,
      type: 'group_invite',
      title: `${inviterName} invited you to join ${groupName}`,
      message: `${inviterName} thinks you'd be a great addition to their group! Click to join.`,
      data: {
        group_id: groupId,
        group_name: groupName,
        sender_id: '', // Will be set by the inviter
        sender_name: inviterName,
        invite_code: inviteCode,
        action_url: `/groups/join/${inviteCode}`
      },
      read: false
    });
  } catch (error) {
    console.error('Error sending group invitation:', error);
    throw error;
  }
}

// Send encouragement notification
export async function sendEncouragementNotification(
  recipientUserId: string,
  senderName: string,
  message: string,
  groupId?: string
): Promise<string> {
  try {
    return await createNotification({
      user_id: recipientUserId,
      type: 'encouragement',
      title: `${senderName} sent you encouragement`,
      message: message,
      data: {
        group_id: groupId,
        sender_name: senderName,
        action_url: groupId ? `/groups/${groupId}` : '/encouragements'
      },
      read: false
    });
  } catch (error) {
    console.error('Error sending encouragement notification:', error);
    throw error;
  }
}

// Real-time notification listener
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    
    callback(notifications);
  });
}

// Delete old notifications (cleanup)
export async function deleteOldNotifications(userId: string, daysOld: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('created_at', '<', cutoffDate)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    throw error;
  }
}
