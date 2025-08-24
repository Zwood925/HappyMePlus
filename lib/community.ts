import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, getDoc, arrayUnion, onSnapshot, setDoc, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { 
  sendFriendRequestNotification, 
  sendUsernameInviteNotification, 
  sendPostReactionNotification, 
  sendPostCommentNotification 
} from './notifications';
import { incrementUserStats, checkAndAwardAchievements, updateStreak } from './achievements';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
  isPublic: boolean;
  reactions: any[];
  comments: any[];
  imageUrl?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isPublic?: boolean;
  createdAt: any;
  groups: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  inviteCode: string;
  createdAt: any;
  isPublic: boolean;
}

export interface FriendRequest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  fromUser?: UserProfile;
}

export interface Invite {
  id?: string;
  fromUserId: string;
  toUsername: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  fromUser?: UserProfile;
}

export interface SocialShare {
  id?: string;
  userId: string;
  postId: string;
  platform: 'twitter' | 'whatsapp' | 'facebook' | 'copy';
  sharedAt: any;
}

// User Profile Functions
export const createUserProfile = async (userData: {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}): Promise<void> => {
  try {
    const profileData: UserProfile = {
      ...userData,
      createdAt: serverTimestamp(),
      groups: []
    };

    await setDoc(doc(db, 'users', userData.uid), profileData);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw new Error('Failed to check username availability');
  }
};

// Search users by username
export const searchUsersByUsername = async (searchQuery: string): Promise<UserProfile[]> => {
  try {
    // Use a range query to search for usernames that start with the query
    const q = query(
      collection(db, 'users'),
      where('username', '>=', searchQuery),
      where('username', '<=', searchQuery + '\uf8ff'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }
};

// Send friend request
export const sendFriendRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
  try {
    // Check if request already exists
    const existingQuery = query(
      collection(db, 'friend_requests'),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      throw new Error('Friend request already sent');
    }

    // Create friend request
    const requestData = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'friend_requests'), requestData);
    
    // Send notification to recipient
    const fromUser = await getUserProfile(fromUserId);
    if (fromUser) {
      await sendFriendRequestNotification(toUserId, fromUserId, fromUser.displayName);
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Get friend requests for a user
export const getFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  try {
    const q = query(
      collection(db, 'friend_requests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests: FriendRequest[] = [];
    
    // Get user profiles for each request
    for (const doc of querySnapshot.docs) {
      const requestData = doc.data() as FriendRequest;
      const fromUser = await getUserProfile(requestData.fromUserId);
      
      requests.push({
        id: doc.id,
        ...requestData,
        fromUser: fromUser || undefined
      });
    }
    
    return requests;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw new Error('Failed to get friend requests');
  }
};

// Accept friend request
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friend_requests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }
    
    const requestData = requestDoc.data() as FriendRequest;
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted'
    });
    
    // Add to friends list for both users (you might want to create a friends collection)
    // For now, we'll just mark the request as accepted
    
    // Update friend stats for both users
    try {
      await incrementUserStats(requestData.fromUserId, 'totalFriends');
      await incrementUserStats(requestData.toUserId, 'totalFriends');
      await checkAndAwardAchievements(requestData.fromUserId);
      await checkAndAwardAchievements(requestData.toUserId);
    } catch (error) {
      console.error('Error updating friend stats:', error);
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw new Error('Failed to accept friend request');
  }
};

// Reject friend request
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friend_requests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'rejected'
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw new Error('Failed to reject friend request');
  }
};

// Get friends list for a user
export const getFriends = async (userId: string): Promise<UserProfile[]> => {
  try {
    // Get accepted friend requests where user is either sender or receiver
    const sentRequests = query(
      collection(db, 'friend_requests'),
      where('fromUserId', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const receivedRequests = query(
      collection(db, 'friend_requests'),
      where('toUserId', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentRequests),
      getDocs(receivedRequests)
    ]);
    
    const friendIds = new Set<string>();
    
    // Add friends from sent requests
    sentSnapshot.forEach(doc => {
      const data = doc.data() as FriendRequest;
      friendIds.add(data.toUserId);
    });
    
    // Add friends from received requests
    receivedSnapshot.forEach(doc => {
      const data = doc.data() as FriendRequest;
      friendIds.add(data.fromUserId);
    });
    
    // Get user profiles for all friends
    const friends: UserProfile[] = [];
    for (const friendId of friendIds) {
      const friendProfile = await getUserProfile(friendId);
      if (friendProfile) {
        friends.push(friendProfile);
      }
    }
    
    return friends;
  } catch (error) {
    console.error('Error getting friends:', error);
    throw new Error('Failed to get friends');
  }
};

// Group Functions
export const createGroup = async (groupData: {
  name: string;
  description: string;
  createdBy: string;
  isPublic?: boolean;
}): Promise<string> => {
  try {
    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const group: Group = {
      id: '', // Will be set by Firestore
      name: groupData.name,
      description: groupData.description,
      createdBy: groupData.createdBy,
      members: [groupData.createdBy],
      inviteCode,
      createdAt: serverTimestamp(),
      isPublic: groupData.isPublic || false
    };

    const docRef = await addDoc(collection(db, 'groups'), group);
    
    // Update the group with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    // Add group to user's groups
    const userRef = doc(db, 'users', groupData.createdBy);
    await updateDoc(userRef, {
      groups: arrayUnion(docRef.id)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error('Failed to create group');
  }
};

export const joinGroupByCode = async (inviteCode: string, userId: string): Promise<string> => {
  try {
    // Find group by invite code
    const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid invite code');
    }

    const groupDoc = querySnapshot.docs[0];
    const group = groupDoc.data() as Group;

    // Check if user is already a member
    if (group.members.includes(userId)) {
      throw new Error('Already a member of this group');
    }

    // Add user to group
    await updateDoc(doc(db, 'groups', groupDoc.id), {
      members: arrayUnion(userId)
    });

    // Add group to user's groups
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      groups: arrayUnion(groupDoc.id)
    });

    return groupDoc.id;
  } catch (error) {
    console.error('Error joining group:', error);
    throw new Error('Failed to join group');
  }
};

export const getGroupByCode = async (inviteCode: string): Promise<Group | null> => {
  try {
    const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const groupDoc = querySnapshot.docs[0];
    return { id: groupDoc.id, ...groupDoc.data() } as Group;
  } catch (error) {
    console.error('Error fetching group:', error);
    throw new Error('Failed to fetch group');
  }
};

export const createPost = async (
  userId: string,
  userName: string,
  content: string,
  isPublic: boolean = true,
  imageFile?: File
): Promise<string> => {
  try {
    let imageUrl: string | undefined;

    // Upload image if provided
    if (imageFile) {
      const imageRef = ref(storage, `posts/${userId}/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const postData = {
      userId,
      userName,
      content,
      isPublic,
      reactions: [],
      comments: [],
      createdAt: serverTimestamp(),
      imageUrl
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    
    // Update user stats and check for achievements
    try {
      await incrementUserStats(userId, 'totalPosts');
      await updateStreak(userId);
      await checkAndAwardAchievements(userId);
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw error here as the post was created successfully
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
};

export const getPublicPosts = async (): Promise<Post[]> => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];

    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as Post);
    });

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
};

// Real-time listener for posts
export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const q = query(
    collection(db, 'posts'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as Post);
    });
    callback(posts);
  });
};

// Reactions Functions
export const addReaction = async (
  postId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const post = postDoc.data() as Post;
    const existingReaction = post.reactions.find((r: any) => r.emoji === emoji);

    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        existingReaction.users = existingReaction.users.filter((id: string) => id !== userId);
        existingReaction.count = Math.max(0, existingReaction.count - 1);
      } else {
        existingReaction.users.push(userId);
        existingReaction.count += 1;
      }
    } else {
      post.reactions.push({
        emoji,
        count: 1,
        users: [userId]
      });
    }

    post.reactions = post.reactions.filter((r: any) => r.count > 0);

    await updateDoc(postRef, {
      reactions: post.reactions
    });
    
    // Send notification to post owner if it's a new reaction
    const userProfile = await getUserProfile(userId);
    if (userProfile && post.userId !== userId) {
      await sendPostReactionNotification(post.userId, userId, userProfile.displayName, postId, emoji);
      
      // Update post owner's stats and check for achievements
      try {
        await incrementUserStats(post.userId, 'totalReactions');
        await checkAndAwardAchievements(post.userId);
      } catch (error) {
        console.error('Error updating post owner stats:', error);
      }
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw new Error('Failed to add reaction');
  }
};

// Comments Functions
export const addComment = async (
  postId: string,
  userId: string,
  userName: string,
  content: string
): Promise<string> => {
  try {
    const commentData = {
      userId,
      userName,
      content,
      createdAt: serverTimestamp()
    };

    const commentRef = await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
    
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(commentRef.id)
    });
    
    // Send notification to post owner
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      const post = postDoc.data() as Post;
      if (post.userId !== userId) {
        await sendPostCommentNotification(post.userId, userId, userName, postId, content);
        
        // Update post owner's stats and check for achievements
        try {
          await incrementUserStats(post.userId, 'totalComments');
          await checkAndAwardAchievements(post.userId);
        } catch (error) {
          console.error('Error updating post owner stats:', error);
        }
      }
    }

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
};

export const getPostComments = async (postId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const comments: any[] = [];

    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
};

// Real-time listener for comments
export const subscribeToComments = (postId: string, callback: (comments: any[]) => void) => {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const comments: any[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(comments);
  });
};

// Enhanced Social Features

// Send username-based invite
export const sendUsernameInvite = async (
  fromUserId: string,
  toUsername: string,
  message?: string
): Promise<void> => {
  try {
    // First, find the user by username
    const q = query(collection(db, 'users'), where('username', '==', toUsername));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found');
    }
    
    const toUserDoc = querySnapshot.docs[0];
    const toUserId = toUserDoc.id;
    
    // Check if invite already exists
    const existingInviteQuery = query(
      collection(db, 'invites'),
      where('fromUserId', '==', fromUserId),
      where('toUsername', '==', toUsername),
      where('status', '==', 'pending')
    );
    const existingInviteSnapshot = await getDocs(existingInviteQuery);
    
    if (!existingInviteSnapshot.empty) {
      throw new Error('Invite already sent');
    }
    
    // Create the invite
    const inviteData: Invite = {
      fromUserId,
      toUsername,
      message,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'invites'), inviteData);
    
    // Send notification to recipient
    const fromUser = await getUserProfile(fromUserId);
    if (fromUser) {
      await sendUsernameInviteNotification(toUserId, fromUserId, fromUser.displayName, message);
    }
  } catch (error) {
    console.error('Error sending username invite:', error);
    throw error;
  }
};

// Get invites for a user
export const getInvitesForUser = async (username: string): Promise<Invite[]> => {
  try {
    const q = query(
      collection(db, 'invites'),
      where('toUsername', '==', username),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const invites: Invite[] = [];
    
    for (const doc of querySnapshot.docs) {
      const invite = { id: doc.id, ...doc.data() } as Invite;
      
      // Get the sender's profile
      if (invite.fromUserId) {
        const fromUser = await getUserProfile(invite.fromUserId);
        if (fromUser) {
          invite.fromUser = fromUser;
        }
      }
      
      invites.push(invite);
    }
    
    return invites;
  } catch (error) {
    console.error('Error fetching invites:', error);
    throw new Error('Failed to fetch invites');
  }
};

// Accept or reject invite
export const respondToInvite = async (inviteId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    await updateDoc(inviteRef, { status });
    
    if (status === 'accepted') {
      // Get the invite to find the users
      const inviteDoc = await getDoc(inviteRef);
      const inviteData = inviteDoc.data() as Invite;
      
      // Create friend request
      await sendFriendRequest(inviteData.fromUserId, inviteData.toUsername);
    }
  } catch (error) {
    console.error('Error responding to invite:', error);
    throw new Error('Failed to respond to invite');
  }
};

// Track social share
export const trackSocialShare = async (
  userId: string,
  postId: string,
  platform: 'twitter' | 'whatsapp' | 'facebook' | 'copy'
): Promise<void> => {
  try {
    const shareData: SocialShare = {
      userId,
      postId,
      platform,
      sharedAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'social_shares'), shareData);
  } catch (error) {
    console.error('Error tracking social share:', error);
    // Don't throw error for tracking - it shouldn't break the share
  }
};

// Get friend activity feed
export const getFriendActivity = async (userId: string): Promise<Post[]> => {
  try {
    // Get user's friends
    const friends = await getFriends(userId);
    const friendIds = friends.map(friend => friend.uid);
    
    if (friendIds.length === 0) {
      return [];
    }
    
    // Get posts from friends
    const q = query(
      collection(db, 'posts'),
      where('userId', 'in', friendIds),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as Post);
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching friend activity:', error);
    throw new Error('Failed to fetch friend activity');
  }
};
