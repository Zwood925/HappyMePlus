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
  type: 'group_invite' | 'support_request' | 'encouragement' | 'group_activity' | 'system' | 'friend_request' | 'username_invite' | 'post_reaction' | 'post_comment' | 'daily_reminder' | 'achievement';
  title: string;
  message: string;
  data?: {
    group_id?: string;
    group_name?: string;
    sender_id?: string;
    sender_name?: string;
    invite_code?: string;
    action_url?: string;
    post_id?: string;
    reaction_emoji?: string;
    comment_text?: string;
    achievement_type?: string;
    streak_count?: number;
  };
  read: boolean;
  created_at: any;
  expires_at?: any;
  priority?: 'low' | 'medium' | 'high';
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

// Send friend request notification
export async function sendFriendRequestNotification(
  recipientUserId: string,
  senderId: string,
  senderName: string
): Promise<string> {
  try {
    return await createNotification({
      user_id: recipientUserId,
      type: 'friend_request',
      title: `${senderName} wants to be your friend`,
      message: `${senderName} sent you a friend request. Accept to start sharing joy together!`,
      data: {
        sender_id: senderId,
        sender_name: senderName,
        action_url: '/friend-requests'
      },
      read: false,
      priority: 'medium'
    });
  } catch (error) {
    console.error('Error sending friend request notification:', error);
    throw error;
  }
}

// Send username invite notification
export async function sendUsernameInviteNotification(
  recipientUserId: string,
  senderId: string,
  senderName: string,
  message?: string
): Promise<string> {
  try {
    return await createNotification({
      user_id: recipientUserId,
      type: 'username_invite',
      title: `${senderName} invited you to connect`,
      message: message || `${senderName} would like to connect with you on HappyMe+!`,
      data: {
        sender_id: senderId,
        sender_name: senderName,
        action_url: '/invites'
      },
      read: false,
      priority: 'medium'
    });
  } catch (error) {
    console.error('Error sending username invite notification:', error);
    throw error;
  }
}

// Send post reaction notification
export async function sendPostReactionNotification(
  postOwnerId: string,
  reactorId: string,
  reactorName: string,
  postId: string,
  emoji: string
): Promise<string> {
  try {
    return await createNotification({
      user_id: postOwnerId,
      type: 'post_reaction',
      title: `${reactorName} reacted to your post`,
      message: `${reactorName} reacted with ${emoji} to your happy moment!`,
      data: {
        sender_id: reactorId,
        sender_name: reactorName,
        post_id: postId,
        reaction_emoji: emoji,
        action_url: `/posts/${postId}`
      },
      read: false,
      priority: 'low'
    });
  } catch (error) {
    console.error('Error sending post reaction notification:', error);
    throw error;
  }
}

// Send post comment notification
export async function sendPostCommentNotification(
  postOwnerId: string,
  commenterId: string,
  commenterName: string,
  postId: string,
  commentText: string
): Promise<string> {
  try {
    return await createNotification({
      user_id: postOwnerId,
      type: 'post_comment',
      title: `${commenterName} commented on your post`,
      message: `${commenterName}: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
      data: {
        sender_id: commenterId,
        sender_name: commenterName,
        post_id: postId,
        comment_text: commentText,
        action_url: `/posts/${postId}`
      },
      read: false,
      priority: 'medium'
    });
  } catch (error) {
    console.error('Error sending post comment notification:', error);
    throw error;
  }
}

// Send daily reminder notification
export async function sendDailyReminderNotification(
  userId: string,
  userName: string
): Promise<string> {
  try {
    return await createNotification({
      user_id: userId,
      type: 'daily_reminder',
      title: 'Time to share your joy! ✨',
      message: `Hey ${userName}! Don't forget to share what made you smile today. Your joy could brighten someone else's day!`,
      data: {
        action_url: '/'
      },
      read: false,
      priority: 'low'
    });
  } catch (error) {
    console.error('Error sending daily reminder notification:', error);
    throw error;
  }
}

// Send achievement notification
export async function sendAchievementNotification(
  userId: string,
  userName: string,
  achievementType: string,
  streakCount?: number
): Promise<string> {
  try {
    let title = '';
    let message = '';
    
    switch (achievementType) {
      case 'first_post':
        title = '🎉 Your first happy moment!';
        message = 'Congratulations on sharing your first moment of joy! Keep spreading happiness!';
        break;
      case 'streak_7':
        title = '🔥 7-day streak!';
        message = `Amazing! You've shared joy for ${streakCount} days in a row. You're building a beautiful habit!`;
        break;
      case 'streak_30':
        title = '🌟 30-day streak!';
        message = `Incredible! You've been sharing joy for ${streakCount} days. You're a joy-spreading champion!`;
        break;
      case 'first_friend':
        title = '👥 Your first friend!';
        message = 'You made your first friend on HappyMe+! Start sharing joy together!';
        break;
      case 'first_reaction':
        title = '💖 First reaction received!';
        message = 'Someone reacted to your post! Your joy is spreading and making others happy!';
        break;
      default:
        title = '🎉 Achievement unlocked!';
        message = 'You\'ve reached a new milestone on your joy journey!';
    }
    
    return await createNotification({
      user_id: userId,
      type: 'achievement',
      title,
      message,
      data: {
        achievement_type: achievementType,
        streak_count: streakCount,
        action_url: '/achievements'
      },
      read: false,
      priority: 'high'
    });
  } catch (error) {
    console.error('Error sending achievement notification:', error);
    throw error;
  }
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
