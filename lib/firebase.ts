// lib/firebase.ts
// Firebase client configuration

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { config } from './config';

// Initialize Firebase
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
};

// Only initialize Firebase if we have the required config and we're not in a build environment
let app;
if (firebaseConfig.apiKey && firebaseConfig.projectId && typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} else {
  console.warn('Firebase config not available or in build environment, skipping initialization');
  app = null;
}

// Initialize Firebase services
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app, 'happyme') : null; // Use the correct database name
export const storage = app ? getStorage(app) : null;

// Connect to emulators in development
if (config.app.isDevelopment) {
  try {
    // Only connect to emulators if they're not already connected
    if (process.env.NODE_ENV === 'development') {
      // Uncomment these lines if you want to use Firebase emulators
      // connectAuthEmulator(auth, 'http://localhost:9099');
      // connectFirestoreEmulator(db, 'localhost', 8080);
      // connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}

export default app; 