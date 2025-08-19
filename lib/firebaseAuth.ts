// lib/firebaseAuth.ts
// Firebase authentication utilities

import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  if (!auth) {
    return { user: null, error: new Error('Firebase auth not initialized') };
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

// Create user with email and password
export async function createUserWithEmail(email: string, password: string) {
  if (!auth) {
    return { user: null, error: new Error('Firebase auth not initialized') };
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Import here to avoid circular dependencies
    const { createUserProfile } = await import('./userProfiles');
    
    // Create user profile in Firestore
    try {
      await createUserProfile(userCredential.user);
      console.log('User profile created successfully for new user:', userCredential.user.uid);
    } catch (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Don't fail the signup if profile creation fails
    }
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

// Sign out user
export async function signOutUser() {
  if (!auth) {
    return { error: new Error('Firebase auth not initialized') };
  }
  
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth?.currentUser || null;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!auth) {
    // Return a no-op unsubscribe function if auth is not initialized
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return auth?.currentUser !== null;
}; 