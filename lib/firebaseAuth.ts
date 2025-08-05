// lib/firebaseAuth.ts
// Firebase authentication utilities

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    console.log('Attempting to sign in with Firebase...');
    console.log('Auth object:', auth);
    console.log('Auth app:', auth.app);
    console.log('Auth config:', auth.app.options);
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error signing in:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    throw error;
  }
};

// Create user with email and password
export const createUserWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    console.log('Attempting to create user with Firebase...');
    console.log('Auth object:', auth);
    console.log('Auth app:', auth.app);
    console.log('Auth config:', auth.app.options);
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
}; 