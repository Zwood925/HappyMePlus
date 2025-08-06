import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function TestAuthTiming() {
  const { user } = useFirebaseAuth();
  const [authState, setAuthState] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔍 Starting Auth State Monitoring...');
    
    // Monitor Firebase Auth state directly
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      addLog(`Firebase Auth State Changed: ${user ? 'User logged in' : 'No user'}`);
      if (user) {
        addLog(`User ID: ${user.uid}`);
        addLog(`User Email: ${user.email}`);
        addLog(`Email Verified: ${user.emailVerified}`);
      }
      setAuthState(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    addLog(`Hook User State: ${user ? 'User available' : 'No user'}`);
    if (user) {
      addLog(`Hook User ID: ${user.uid}`);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Auth Timing Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-purple-700">Firebase Auth State:</h3>
              <p>Status: {authState ? '✅ User logged in' : '❌ No user'}</p>
              {authState && (
                <>
                  <p>User ID: {authState.uid}</p>
                  <p>Email: {authState.email}</p>
                  <p>Email Verified: {authState.emailVerified ? 'Yes' : 'No'}</p>
                </>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-purple-700">Hook User State:</h3>
              <p>Status: {user ? '✅ User available' : '❌ No user'}</p>
              {user && (
                <>
                  <p>User ID: {user.uid}</p>
                  <p>Email: {user.email}</p>
                  <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Auth State Logs</h2>
          <div className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 