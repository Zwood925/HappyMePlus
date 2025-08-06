import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, Timestamp, query, where } from 'firebase/firestore';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function DebugFirebase() {
  const { user } = useFirebaseAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('🔍 Starting Firebase Diagnostics...');
      
      // Test 1: Check Firebase app configuration
      addLog('Test 1: Checking Firebase app configuration...');
      addLog(`- App name: ${db.app.name}`);
      addLog(`- Project ID: ${db.app.options.projectId}`);
      addLog(`- Database ID: default`);
      
      // Test 2: Check authentication status
      addLog('Test 2: Checking authentication status...');
      addLog(`- User authenticated: ${user ? 'Yes' : 'No'}`);
      if (user) {
        addLog(`- User ID: ${user.uid}`);
        addLog(`- User email: ${user.email}`);
        addLog(`- Email verified: ${user.emailVerified}`);
      }
      
      // Test 3: Test basic collection access
      addLog('Test 3: Testing basic collection access...');
      const collectionRef = collection(db, 'happy_moments');
      addLog('✓ Collection reference created');
      
      // Test 4: Test simple getDocs
      addLog('Test 4: Testing simple getDocs...');
      const simpleQuery = query(collectionRef);
      addLog('✓ Query created');
      
      const snapshot = await getDocs(simpleQuery);
      addLog(`✓ getDocs successful, found ${snapshot.size} documents`);
      
      // Test 5: Test document creation
      addLog('Test 5: Testing document creation...');
      const testDoc = {
        test: true,
        timestamp: Timestamp.now(),
        message: 'Debug test document',
        userId: user?.uid || 'test-user'
      };
      
      const docRef = await addDoc(collectionRef, testDoc);
      addLog(`✓ Document created with ID: ${docRef.id}`);
      
      // Test 6: Test filtered query
      addLog('Test 6: Testing filtered query...');
      if (user?.uid) {
        const filteredQuery = query(
          collectionRef,
          where('userId', '==', user.uid)
        );
        
        const filteredSnapshot = await getDocs(filteredQuery);
        addLog(`✓ Filtered query successful, found ${filteredSnapshot.size} documents for user`);
      } else {
        addLog('⚠️ Skipping filtered query - no authenticated user');
      }
      
      addLog('🎉 All tests passed! Firebase is working correctly.');
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      addLog(`Error code: ${(error as any)?.code}`);
      addLog(`Error message: ${(error as any)?.message}`);
      
      // Additional error analysis
      if ((error as any)?.code === 'permission-denied') {
        addLog('🔒 PERMISSION DENIED: Check Firestore security rules');
      } else if ((error as any)?.code === 'unavailable') {
        addLog('🌐 UNAVAILABLE: Network or service issue');
      } else if ((error as any)?.code === 'internal') {
        addLog('⚙️ INTERNAL ERROR: Firebase service issue');
      } else if ((error as any)?.code === 'invalid-argument') {
        addLog('📝 INVALID ARGUMENT: Check query parameters');
      }
      
      console.error('Firebase diagnostic error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Firebase Debug Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-purple-700">Firebase App:</h3>
              <p>Name: {db.app.name}</p>
              <p>Project ID: {db.app.options.projectId}</p>
              <p>Database: default</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-700">Authentication:</h3>
              <p>Status: {user ? '✅ Authenticated' : '❌ Not authenticated'}</p>
              {user && (
                <>
                  <p>User ID: {user.uid}</p>
                  <p>Email: {user.email}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Diagnostic Tests</h2>
            <div className="space-x-2">
              <button
                onClick={clearLogs}
                className="btn btn-outline btn-sm"
              >
                Clear Logs
              </button>
              <button
                onClick={runDiagnostics}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Running Tests...' : 'Run Diagnostics'}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {logs.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click "Run Diagnostics" to start.</p>
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-purple-700">1. Test in Incognito Mode</h3>
              <p className="text-sm text-gray-600">
                Open this page in an incognito/private browser window to rule out browser cache or extension issues.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-700">2. Check Project ID</h3>
              <p className="text-sm text-gray-600">
                Verify that the Project ID shown above matches your Firebase project. You mentioned the database is called "happyme".
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-700">3. Network Issues</h3>
              <p className="text-sm text-gray-600">
                Try disabling VPN, firewall, or antivirus temporarily to see if they're blocking Firebase connections.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-700">4. Firebase Console</h3>
              <p className="text-sm text-gray-600">
                Check your Firebase Console to ensure Firestore is enabled and security rules allow read/write for authenticated users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 