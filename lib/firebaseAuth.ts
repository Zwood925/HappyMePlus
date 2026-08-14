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
  try {
    alert("LOGIN CHECKPOINT 1: Auth Request Started");
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    alert(`LOGIN CHECKPOINT 2: Auth Succeeded!\nUID: ${userCredential.user.uid}`);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    alert(`LOGIN ERROR:\n${error?.message || JSON.stringify(error)}`);
    return { user: null, error: error as Error };
  }
}

// Create user with email and password
export async function createUserWithEmail(email: string, password: string) {
  try {
    alert("SIGNUP CHECKPOINT 1: Auth User Creation Started");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    alert(`SIGNUP CHECKPOINT 2: Auth Created User!\nUID: ${userCredential.user.uid}`);
    
    // Import here to avoid circular dependencies
    alert("SIGNUP CHECKPOINT 3: Importing userProfiles module...");
    const { createUserProfile } = await import('./userProfiles');
    
    // Create user profile in Firestore
    try {
      alert("SIGNUP CHECKPOINT 4: Calling createUserProfile in Firestore...");
      await createUserProfile(userCredential.user);
      alert("SIGNUP CHECKPOINT 5: User profile created successfully in Firestore!");
    } catch (profileError: any) {
      alert(`SIGNUP PROFILE ERROR:\n${profileError?.message || JSON.stringify(profileError)}`);
      console.error('Failed to create user profile:', profileError);
      // Don't fail the signup if profile creation fails
    }
    
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    alert(`SIGNUP ERROR:\n${error?.message || JSON.stringify(error)}`);
    return { user: null, error: error as Error };
  }
}

// Sign out user
export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};