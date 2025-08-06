import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function TestFirestore() {
  const { user } = useFirebaseAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addLog('Starting Firestore tests...');
      
      // Test 1: Basic collection access
      addLog('Test 1: Testing basic collection access...');
      const collectionRef = collection(db, 'test_collection');
      addLog('✓ Collection reference created');
      
      // Test 2: Simple getDocs without filters
      addLog('Test 2: Testing getDocs without filters...');
      const snapshot = await getDocs(collectionRef);
      addLog(`✓ getDocs successful, found ${snapshot.size} documents`);
      
      // Test 3: Add a test document
      addLog('Test 3: Testing document creation...');
      const testDoc = {
        test: true,
        timestamp: Timestamp.now(),
        message: 'Test document from HappyMePlus'
      };
      
      const docRef = await addDoc(collectionRef, testDoc);
      addLog(`✓ Document created with ID: ${docRef.id}`);
      
      // Test 4: Read the document back
      addLog('Test 4: Testing document retrieval...');
      const newSnapshot = await getDocs(collectionRef);
      addLog(`✓ Retrieved ${newSnapshot.size} documents after creation`);
      
      // Test 5: Test happy_moments collection
      addLog('Test 5: Testing happy_moments collection...');
      const momentsRef = collection(db, 'happy_moments');
      const momentsSnapshot = await getDocs(momentsRef);
      addLog(`✓ happy_moments collection accessible, found ${momentsSnapshot.size} documents`);
      
      addLog('🎉 All tests passed! Firestore is working correctly.');
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      addLog(`Error code: ${(error as any)?.code}`);
      addLog(`Error message: ${(error as any)?.message}`);
      console.error('Firestore test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Firestore Connectivity Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Firestore Tests</h2>
          <button
            onClick={runTests}
            disabled={loading}
            className="btn btn-primary mb-4"
          >
            {loading ? 'Running Tests...' : 'Run Firestore Tests'}
          </button>
          
          <div className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click the button above to start testing.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Tips</h2>
          <ul className="space-y-2 text-sm">
            <li>• Make sure you're logged in (Firestore rules may require authentication)</li>
            <li>• Check that your Firebase project is active and billing is set up</li>
            <li>• Verify Firestore is enabled in your Firebase Console</li>
            <li>• Check your Firestore security rules allow read/write for authenticated users</li>
            <li>• Ensure your Firebase config is correct in .env.local</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 