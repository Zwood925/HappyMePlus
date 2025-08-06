import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function TestWrite() {
  const { user } = useFirebaseAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testWrite = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing document creation...');
      console.log('User:', user);
      console.log('User ID:', user?.uid);
      
      const testDoc = {
        test: true,
        timestamp: Timestamp.now(),
        message: 'Test write document',
        userId: user?.uid || 'test-user'
      };
      
      console.log('Test document data:', testDoc);
      
      const collectionRef = collection(db, 'happy_moments');
      console.log('Collection reference:', collectionRef);
      
      console.log('About to call addDoc...');
      const docRef = await addDoc(collectionRef, testDoc);
      console.log('Document created successfully!');
      console.log('Document ID:', docRef.id);
      
      setResult(`✅ SUCCESS! Document created with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error('Document creation failed:', error);
      console.error('Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        fullError: error
      });
      
      setResult(`❌ FAILED: ${(error as any)?.code} - ${(error as any)?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Test Document Creation</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Document Creation</h2>
          <button
            onClick={testWrite}
            disabled={loading || !user}
            className="btn btn-primary btn-lg w-full mb-4"
          >
            {loading ? 'Testing...' : 'Test Document Creation'}
          </button>
          
          {!user && (
            <p className="text-red-600 mb-4">Please log in first to test document creation.</p>
          )}
          
          {result && (
            <div className={`p-4 rounded-lg ${
              result.includes('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <strong>Result:</strong> {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 