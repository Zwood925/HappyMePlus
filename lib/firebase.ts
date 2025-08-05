// lib/firebase.ts
// Firebase client configuration

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { config } from './config';

// Debug: Log Firebase config
console.log('Firebase config:', {
  apiKey: config.firebase.apiKey ? 'SET' : 'NOT SET',
  authDomain: config.firebase.authDomain ? 'SET' : 'NOT SET',
  projectId: config.firebase.projectId ? 'SET' : 'NOT SET',
  storageBucket: config.firebase.storageBucket ? 'SET' : 'NOT SET',
  messagingSenderId: config.firebase.messagingSenderId ? 'SET' : 'NOT SET',
  appId: config.firebase.appId ? 'SET' : 'NOT SET',
});

// Debug: Log actual values (first few characters)
console.log('Firebase config values:', {
  apiKey: config.firebase.apiKey ? `${config.firebase.apiKey.substring(0, 10)}...` : 'NOT SET',
  authDomain: config.firebase.authDomain ? `${config.firebase.authDomain.substring(0, 20)}...` : 'NOT SET',
  projectId: config.firebase.projectId || 'NOT SET',
  storageBucket: config.firebase.storageBucket || 'NOT SET',
  messagingSenderId: config.firebase.messagingSenderId || 'NOT SET',
  appId: config.firebase.appId ? `${config.firebase.appId.substring(0, 20)}...` : 'NOT SET',
});

// Initialize Firebase
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
};

console.log('Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

console.log('Firebase app initialized:', app);
console.log('Firebase app options:', app.options);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('Firebase auth initialized:', auth);
console.log('Firebase auth app:', auth.app);

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