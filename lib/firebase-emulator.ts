// lib/firebase-emulator.ts
// Firebase configuration with local emulators for development

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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to local emulators
if (config.app.isDevelopment) {
  try {
    console.log('Connecting to Firebase emulators...');
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('✅ Connected to Auth emulator');
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Connected to Firestore emulator');
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Connected to Storage emulator');
    
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}

export default app; 