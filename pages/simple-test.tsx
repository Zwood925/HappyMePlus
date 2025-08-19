import { useState } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function SimpleTest() {
  const { user } = useFirebaseAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testBasicConnection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Test 1: Basic Firebase import
      const { initializeApp, getApps } = await import('firebase/app');
      setMessage('✅ Firebase app imported successfully\n');
      
      // Test 2: Check if app is initialized
      const apps = getApps();
      setMessage(prev => prev + `✅ Firebase apps count: ${apps.length}\n`);
      
      // Test 3: Test Firestore import
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      setMessage(prev => prev + '✅ Firestore imported successfully\n');
      
      // Test 4: Test our Firebase config
      const { db } = await import('../lib/firebase');
      setMessage(prev => prev + '✅ Our Firebase db instance created\n');
      
      // Test 5: Try a simple write operation
      if (user?.uid) {
        const testData = {
          test: true,
          userId: user.uid,
          timestamp: serverTimestamp(),
          message: 'Simple connection test'
        };
        
        const testRef = await addDoc(collection(db, 'connection_test'), testData);
        setMessage(prev => prev + `✅ Test write successful! Document ID: ${testRef.id}\n`);
      } else {
        setMessage(prev => prev + '⚠️ No user logged in, skipping write test\n');
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setMessage(prev => prev + `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testUserProfile = async () => {
    if (!user?.uid) {
      setMessage('Please sign in first');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const { ensureUserProfile } = await import('../lib/userProfiles');
      const profile = await ensureUserProfile(user);
      setMessage(`✅ User profile ensured: ${profile.id}`);
    } catch (error) {
      console.error('Profile test error:', error);
      setMessage(`❌ Profile error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Firebase Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user.uid}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          ) : (
            <p className="text-gray-600">No user logged in</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          
          <div className="space-y-4">
            <button
              onClick={testBasicConnection}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test Basic Firebase Connection
            </button>
            
            <button
              onClick={testUserProfile}
              disabled={loading || !user}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test User Profile Creation
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
              {message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 