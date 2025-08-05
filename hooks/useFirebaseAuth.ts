// hooks/useFirebaseAuth.ts
// Custom hook for Firebase authentication

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser } from '../lib/firebaseAuth';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user state
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return { user, loading };
} 