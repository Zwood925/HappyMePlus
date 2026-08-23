import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  browserLocalPersistence, 
  indexedDBLocalPersistence,
  inMemoryPersistence, 
  Auth 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore,
  memoryLocalCache, 
  Firestore 
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { config } from './config';

const firebaseConfig = {
  apiKey: config.firebase?.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: config.firebase?.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: config.firebase?.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: config.firebase?.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.firebase?.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: config.firebase?.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 1. Initialize Firebase App safely (prevents duplicate app errors)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth with persistent session fallbacks for iOS WKWebView
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence]
  });
} catch {
  auth = getAuth(app);
}

// 3. Initialize Firestore with memory caching & long polling (guarded against Next.js hot-reloads)
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true,
  });
} catch {
  db = getFirestore(app);
}

export const storage: FirebaseStorage = getStorage(app);
export { db, auth };
export default app;