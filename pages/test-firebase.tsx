import { useState } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { createUserWithEmail, signInWithEmail } from '../lib/firebaseAuth';
import { addHappyMoment } from '../lib/firestore';
import { createGroup } from '../lib/groups';
import { getUserProfile, ensureUserProfile } from '../lib/userProfiles';

export default function TestFirebase() {
  const { user } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await createUserWithEmail(email, password);
      if (result.error) {
        setMessage(`Signup failed: ${result.error.message}`);
      } else {
        setMessage('Signup successful! User profile should be created automatically.');
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await signInWithEmail(email, password);
      if (result.error) {
        setMessage(`Signin failed: ${result.error.message}`);
      } else {
        setMessage('Signin successful!');
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestHappyMoment = async () => {
    if (!user?.uid) {
      setMessage('Please sign in first');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const momentId = await addHappyMoment('Test happy moment!', user.uid);
      setMessage(`Happy moment created with ID: ${momentId}`);
    } catch (error) {
      setMessage(`Error creating happy moment: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestGroup = async () => {
    if (!user?.uid) {
      setMessage('Please sign in first');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const groupId = await createGroup('Test Group', 'This is a test group', user.uid);
      setMessage(`Group created with ID: ${groupId}`);
    } catch (error) {
      setMessage(`Error creating group: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserProfile = async () => {
    if (!user?.uid) {
      setMessage('Please sign in first');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const profile = await ensureUserProfile(user);
      setMessage(`User profile ensured: ${profile.id}`);
    } catch (error) {
      setMessage(`Error ensuring user profile: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="password123"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Sign Up
              </button>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}

        {user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Operations</h2>
            
            <div className="space-y-2">
              <button
                onClick={handleTestUserProfile}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Test User Profile
              </button>
              
              <button
                onClick={handleTestHappyMoment}
                disabled={loading}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                Test Happy Moment
              </button>
              
              <button
                onClick={handleTestGroup}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Test Group Creation
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
} 