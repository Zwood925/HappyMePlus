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
  setDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  display_name?: string;
  created_at: any;
  updated_at: any;
  default_group_id?: string;
  notification_preferences?: {
    email_notifications: boolean;
    push_notifications: boolean;
    group_notifications: boolean;
    support_notifications: boolean;
    group_invites: boolean;
  };
  group_settings?: {
    support_groups: string[]; // Group IDs to notify when user feels down
    default_happy_moment_groups: string[]; // Default groups for happy moments
  };
  settings?: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

// Create a new user profile
export async function createUserProfile(user: User, displayName?: string): Promise<string> {
  try {
    console.log('Creating user profile for:', user.uid);
    
    const profileData: Omit<UserProfile, 'id'> = {
      user_id: user.uid,
      email: user.email || '',
      display_name: displayName || user.displayName || '',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      notification_preferences: {
        email_notifications: true,
        push_notifications: true,
        group_notifications: true
      },
      settings: {
        theme: 'auto',
        language: 'en'
      }
    };

    // Use setDoc with the user ID as the document ID for consistency
    const profileRef = doc(db, 'user_profiles', user.uid);
    await setDoc(profileRef, profileData);
    
    console.log('User profile created successfully:', user.uid);
    return user.uid;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// Get user profile by user ID
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, 'user_profiles', userId));
    if (profileDoc.exists()) {
      return {
        id: profileDoc.id,
        ...profileDoc.data()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const profileRef = doc(db, 'user_profiles', userId);
    await updateDoc(profileRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Check if user profile exists
export async function userProfileExists(userId: string): Promise<boolean> {
  try {
    const profileDoc = await getDoc(doc(db, 'user_profiles', userId));
    return profileDoc.exists();
  } catch (error) {
    console.error('Error checking user profile existence:', error);
    return false;
  }
}

// Ensure user profile exists (create if it doesn't)
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  try {
    console.log('Ensuring user profile exists for:', user.uid);
    
    // Check if profile exists
    const existingProfile = await getUserProfile(user.uid);
    if (existingProfile) {
      console.log('User profile already exists:', user.uid);
      return existingProfile;
    }
    
    // Create profile if it doesn't exist
    console.log('Creating new user profile for:', user.uid);
    await createUserProfile(user);
    
    // Return the newly created profile
    const newProfile = await getUserProfile(user.uid);
    if (!newProfile) {
      throw new Error('Failed to create user profile');
    }
    
    return newProfile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    throw error;
  }
}

// Update group notification preferences
export async function updateGroupNotificationPreferences(
  userId: string, 
  supportGroups: string[], 
  defaultHappyMomentGroups: string[]
): Promise<void> {
  try {
    const profileRef = doc(db, 'user_profiles', userId);
    await updateDoc(profileRef, {
      group_settings: {
        support_groups: supportGroups,
        default_happy_moment_groups: defaultHappyMomentGroups,
      },
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating group notification preferences:', error);
    throw error;
  }
}

// Get user's support groups (groups to notify when user feels down)
export async function getUserSupportGroups(userId: string): Promise<string[]> {
  try {
    const profileDoc = await getDoc(doc(db, 'user_profiles', userId));
    if (profileDoc.exists()) {
      const profile = profileDoc.data() as UserProfile;
      return profile.group_settings?.support_groups || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user support groups:', error);
    return [];
  }
}

// Get user's default happy moment groups
export async function getUserDefaultHappyMomentGroups(userId: string): Promise<string[]> {
  try {
    const profileDoc = await getDoc(doc(db, 'user_profiles', userId));
    if (profileDoc.exists()) {
      const profile = profileDoc.data() as UserProfile;
      return profile.group_settings?.default_happy_moment_groups || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user default happy moment groups:', error);
    return [];
  }
} 