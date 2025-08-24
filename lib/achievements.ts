import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { sendAchievementNotification } from './notifications';

export interface UserStats {
  totalPosts: number;
  totalReactions: number;
  totalComments: number;
  totalFriends: number;
  streakDays: number;
  lastPostDate?: Date;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'posts' | 'reactions' | 'comments' | 'friends' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Post achievements
  {
    id: 'first_post',
    title: 'First Joy',
    description: 'Share your first moment of joy',
    icon: '🌟',
    requirement: 1,
    type: 'posts',
    rarity: 'common'
  },
  {
    id: 'joy_spreader',
    title: 'Joy Spreader',
    description: 'Share 10 moments of joy',
    icon: '✨',
    requirement: 10,
    type: 'posts',
    rarity: 'common'
  },
  {
    id: 'happiness_ambassador',
    title: 'Happiness Ambassador',
    description: 'Share 50 moments of joy',
    icon: '🎉',
    requirement: 50,
    type: 'posts',
    rarity: 'rare'
  },
  {
    id: 'joy_master',
    title: 'Joy Master',
    description: 'Share 100 moments of joy',
    icon: '🏆',
    requirement: 100,
    type: 'posts',
    rarity: 'epic'
  },

  // Reaction achievements
  {
    id: 'first_reaction',
    title: 'First Reaction',
    description: 'Receive your first reaction',
    icon: '💖',
    requirement: 1,
    type: 'reactions',
    rarity: 'common'
  },
  {
    id: 'beloved',
    title: 'Beloved',
    description: 'Receive 25 reactions',
    icon: '💝',
    requirement: 25,
    type: 'reactions',
    rarity: 'common'
  },
  {
    id: 'heart_warmer',
    title: 'Heart Warmer',
    description: 'Receive 100 reactions',
    icon: '🔥',
    requirement: 100,
    type: 'reactions',
    rarity: 'rare'
  },

  // Comment achievements
  {
    id: 'first_comment',
    title: 'First Comment',
    description: 'Receive your first comment',
    icon: '💬',
    requirement: 1,
    type: 'comments',
    rarity: 'common'
  },
  {
    id: 'conversation_starter',
    title: 'Conversation Starter',
    description: 'Receive 10 comments',
    icon: '🗣️',
    requirement: 10,
    type: 'comments',
    rarity: 'common'
  },

  // Friend achievements
  {
    id: 'first_friend',
    title: 'First Friend',
    description: 'Make your first friend',
    icon: '👥',
    requirement: 1,
    type: 'friends',
    rarity: 'common'
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Make 10 friends',
    icon: '🦋',
    requirement: 10,
    type: 'friends',
    rarity: 'rare'
  },
  {
    id: 'community_pillar',
    title: 'Community Pillar',
    description: 'Make 25 friends',
    icon: '🏛️',
    requirement: 25,
    type: 'friends',
    rarity: 'epic'
  },

  // Streak achievements
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Share joy for 7 days in a row',
    icon: '📅',
    requirement: 7,
    type: 'streak',
    rarity: 'rare'
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Share joy for 30 days in a row',
    icon: '📆',
    requirement: 30,
    type: 'streak',
    rarity: 'epic'
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Share joy for 100 days in a row',
    icon: '⚡',
    requirement: 100,
    type: 'streak',
    rarity: 'legendary'
  }
];

export async function getUserStats(userId: string): Promise<UserStats> {
  const userStatsRef = doc(db, 'user_stats', userId);
  const userStatsDoc = await getDoc(userStatsRef);
  
  if (userStatsDoc.exists()) {
    return userStatsDoc.data() as UserStats;
  }
  
  // Initialize default stats
  const defaultStats: UserStats = {
    totalPosts: 0,
    totalReactions: 0,
    totalComments: 0,
    totalFriends: 0,
    streakDays: 0,
    achievements: []
  };
  
  await setDoc(userStatsRef, defaultStats);
  return defaultStats;
}

export async function updateUserStats(
  userId: string, 
  updates: Partial<UserStats>
): Promise<UserStats> {
  const userStatsRef = doc(db, 'user_stats', userId);
  
  // Convert Date objects to Firestore timestamps
  const firestoreUpdates: any = { ...updates };
  if (updates.lastPostDate) {
    firestoreUpdates.lastPostDate = updates.lastPostDate;
  }
  
  await updateDoc(userStatsRef, firestoreUpdates);
  
  // Get updated stats
  const updatedDoc = await getDoc(userStatsRef);
  return updatedDoc.data() as UserStats;
}

export async function incrementUserStats(
  userId: string, 
  field: keyof UserStats, 
  amount: number = 1
): Promise<UserStats> {
  const userStatsRef = doc(db, 'user_stats', userId);
  
  if (field === 'totalPosts' || field === 'totalReactions' || 
      field === 'totalComments' || field === 'totalFriends' || 
      field === 'streakDays') {
    await updateDoc(userStatsRef, {
      [field]: increment(amount)
    });
  }
  
  // Get updated stats
  const updatedDoc = await getDoc(userStatsRef);
  return updatedDoc.data() as UserStats;
}

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  const stats = await getUserStats(userId);
  const newAchievements: string[] = [];
  
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already earned
    if (stats.achievements.includes(achievement.id)) {
      continue;
    }
    
    let earned = false;
    let currentValue = 0;
    
    switch (achievement.type) {
      case 'posts':
        currentValue = stats.totalPosts;
        break;
      case 'reactions':
        currentValue = stats.totalReactions;
        break;
      case 'comments':
        currentValue = stats.totalComments;
        break;
      case 'friends':
        currentValue = stats.totalFriends;
        break;
      case 'streak':
        currentValue = stats.streakDays;
        break;
    }
    
    if (currentValue >= achievement.requirement) {
      earned = true;
    }
    
    if (earned) {
      newAchievements.push(achievement.id);
      
             // Send achievement notification
       await sendAchievementNotification(
         userId,
         achievement.title,
         achievement.description
       );
    }
  }
  
  // Update user stats with new achievements
  if (newAchievements.length > 0) {
    await updateUserStats(userId, {
      achievements: [...stats.achievements, ...newAchievements]
    });
  }
  
  return newAchievements;
}

export async function updateStreak(userId: string): Promise<number> {
  const stats = await getUserStats(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let newStreak = stats.streakDays;
  
  if (stats.lastPostDate) {
    const lastPost = stats.lastPostDate instanceof Date 
      ? stats.lastPostDate 
      : (stats.lastPostDate as any).toDate?.() || stats.lastPostDate;
    
    const lastPostDay = new Date(lastPost);
    lastPostDay.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((today.getTime() - lastPostDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      // Consecutive day
      newStreak = stats.streakDays + 1;
    } else if (dayDiff === 0) {
      // Same day, keep current streak
      newStreak = stats.streakDays;
    } else {
      // Gap in streak, reset to 1
      newStreak = 1;
    }
  } else {
    // First post ever
    newStreak = 1;
  }
  
  await updateUserStats(userId, {
    streakDays: newStreak,
    lastPostDate: today
  });
  
  return newStreak;
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
}

export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.rarity === rarity);
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 bg-gray-100';
    case 'rare':
      return 'text-blue-600 bg-blue-100';
    case 'epic':
      return 'text-purple-600 bg-purple-100';
    case 'legendary':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
