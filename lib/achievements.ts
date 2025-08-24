import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { sendAchievementNotification } from './notifications';

export interface UserStats {
  totalPosts: number;
  totalReactions: number;
  totalComments: number;
  totalFriends: number;
  streakDays: number;
  lastPostDate?: any;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
  type: string;
}

// Define achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_post',
    title: 'First Joy Share',
    description: 'Share your first moment of joy',
    icon: '🎉',
    condition: (stats) => stats.totalPosts >= 1,
    type: 'first_post'
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Share joy for 7 days in a row',
    icon: '🔥',
    condition: (stats) => stats.streakDays >= 7,
    type: 'streak_7'
  },
  {
    id: 'streak_30',
    title: 'Joy Champion',
    description: 'Share joy for 30 days in a row',
    icon: '🌟',
    condition: (stats) => stats.streakDays >= 30,
    type: 'streak_30'
  },
  {
    id: 'first_friend',
    title: 'Friend Finder',
    description: 'Make your first friend',
    icon: '👥',
    condition: (stats) => stats.totalFriends >= 1,
    type: 'first_friend'
  },
  {
    id: 'first_reaction',
    title: 'Joy Spreader',
    description: 'Receive your first reaction',
    icon: '💖',
    condition: (stats) => stats.totalReactions >= 1,
    type: 'first_reaction'
  },
  {
    id: 'post_master',
    title: 'Joy Master',
    description: 'Share 50 moments of joy',
    icon: '🏆',
    condition: (stats) => stats.totalPosts >= 50,
    type: 'post_master'
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Make 10 friends',
    icon: '🦋',
    condition: (stats) => stats.totalFriends >= 10,
    type: 'social_butterfly'
  }
];

// Get user stats
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data() as UserStats;
    } else {
      // Create default stats
      const defaultStats: UserStats = {
        totalPosts: 0,
        totalReactions: 0,
        totalComments: 0,
        totalFriends: 0,
        streakDays: 0,
        achievements: []
      };
      await setDoc(statsRef, defaultStats);
      return defaultStats;
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Update user stats
export const updateUserStats = async (userId: string, updates: Partial<UserStats>): Promise<void> => {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    await updateDoc(statsRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

// Increment a stat
export const incrementStat = async (userId: string, stat: keyof UserStats, amount: number = 1): Promise<void> => {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    await updateDoc(statsRef, {
      [stat]: increment(amount),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing stat:', error);
    throw error;
  }
};

// Check and award achievements
export const checkAchievements = async (userId: string, userName: string): Promise<string[]> => {
  try {
    const stats = await getUserStats(userId);
    const newAchievements: string[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (!stats.achievements.includes(achievement.id) && achievement.condition(stats)) {
        // Award achievement
        newAchievements.push(achievement.id);
        
        // Send notification
        await sendAchievementNotification(userId, userName, achievement.type, stats.streakDays);
      }
    }
    
    if (newAchievements.length > 0) {
      // Update user stats with new achievements
      await updateUserStats(userId, {
        achievements: [...stats.achievements, ...newAchievements]
      });
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Update streak when user posts
export const updateStreak = async (userId: string): Promise<void> => {
  try {
    const stats = await getUserStats(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastPostDate = stats.lastPostDate?.toDate ? stats.lastPostDate.toDate() : null;
    const lastPostDay = lastPostDate ? new Date(lastPostDate) : null;
    lastPostDay?.setHours(0, 0, 0, 0);
    
    if (!lastPostDay || lastPostDay.getTime() < today.getTime() - 24 * 60 * 60 * 1000) {
      // Reset streak if more than 1 day has passed
      await updateUserStats(userId, {
        streakDays: 1,
        lastPostDate: serverTimestamp()
      });
    } else if (lastPostDay.getTime() === today.getTime()) {
      // Already posted today, don't increment
      return;
    } else {
      // Continue streak
      await updateUserStats(userId, {
        streakDays: stats.streakDays + 1,
        lastPostDate: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

// Get user's achievements
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    const stats = await getUserStats(userId);
    return ACHIEVEMENTS.filter(achievement => stats.achievements.includes(achievement.id));
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
};
