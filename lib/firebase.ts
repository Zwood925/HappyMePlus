// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  browserLocalPersistence, 
  inMemoryPersistence, 
  Auth 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  memoryLocalCache, 
  Firestore 
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { config } from './config';

const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth setup (iOS Web Lock fix)
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: [browserLocalPersistence, inMemoryPersistence]
  });
} catch (e) {
  auth = getAuth(app);
}

// Initialize Firestore with memoryLocalCache to bypass IndexedDB Web Locks on iOS
export const db: Firestore = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

export const storage: FirebaseStorage = getStorage(app);
export { auth };

export default app;