import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, getDoc, arrayUnion, onSnapshot } from 'firebase/firestore';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
  isPublic: boolean;
  reactions: any[];
  comments: any[];
}

export const createPost = async (
  userId: string,
  userName: string,
  content: string,
  isPublic: boolean = true
): Promise<string> => {
  try {
    const postData = {
      userId,
      userName,
      content,
      isPublic,
      reactions: [],
      comments: [],
      createdAt: serverTimestamp()
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
