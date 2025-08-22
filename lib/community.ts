import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, getDoc, arrayUnion, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

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
