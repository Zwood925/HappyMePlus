import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function TestWriteSimple() {
  const { user } = useFirebaseAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSimpleWrite = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('=== SIMPLE WRITE TEST ===');
      console.log('User ID:', user?.uid);
      
      // Test 1: Simple document with minimal fields
      const simpleDoc = {
        userId: user?.uid,
        test: true,
        createdAt: Timestamp.now()
      };
      
      console.log('Simple document data:', simpleDoc);
      
      const collectionRef = collection(db, 'happy_moments');
      console.log('About to create simple document...');
      
      const docRef = await addDoc(collectionRef, simpleDoc);
      console.log('✅ Simple document created! ID:', docRef.id);
      
      setResult(`✅ SUCCESS! Simple document created with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error('❌ Simple document creation failed:', error);
      console.error('Error code:', (error as any)?.code);
      console.error('Error message:', (error as any)?.message);
      
      setResult(`❌ FAILED: ${(error as any)?.code} - ${(error as any)?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFullWrite = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('=== FULL WRITE TEST ===');
      console.log('User ID:', user?.uid);
      
      // Test 2: Full document matching our app structure
      const fullDoc = {
        content: 'Test happy moment content',
        userId: user?.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      console.log('Full document data:', fullDoc);
      
      const collectionRef = collection(db, 'happy_moments');
      console.log('About to create full document...');
      
      const docRef = await addDoc(collectionRef, fullDoc);
      console.log('✅ Full document created! ID:', docRef.id);
      
      setResult(`✅ SUCCESS! Full document created with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error('❌ Full document creation failed:', error);
      console.error('Error code:', (error as any)?.code);
      console.error('Error message:', (error as any)?.message);
      
      setResult(`❌ FAILED: ${(error as any)?.code} - ${(error as any)?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Simple Write Tests</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 1: Simple Document</h2>
          <p className="text-sm text-gray-600 mb-4">
            Creates a minimal document with just userId, test flag, and timestamp.
          </p>
          <button
            onClick={testSimpleWrite}
            disabled={loading || !user}
            className="btn btn-outline btn-primary w-full mb-4"
          >
            {loading ? 'Testing...' : 'Test Simple Document'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 2: Full Document</h2>
          <p className="text-sm text-gray-600 mb-4">
            Creates a document matching our app's happy moment structure.
          </p>
          <button
            onClick={testFullWrite}
            disabled={loading || !user}
            className="btn btn-primary w-full mb-4"
          >
            {loading ? 'Testing...' : 'Test Full Document'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className={`p-4 rounded-lg ${
              result.includes('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <strong>Result:</strong> {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 