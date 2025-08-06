import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function TestEmailVerification() {
  const { user } = useFirebaseAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [authState, setAuthState] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSendVerification = async () => {
    if (!user) return;
    
    setSending(true);
    setError('');
    
    try {
      await sendEmailVerification(user);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      setError(error.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  const handleRefreshUser = async () => {
    if (!user) return;
    
    try {
      await user.reload();
      window.location.reload();
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError('Failed to refresh user status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Email Verification Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-purple-700">Hook User:</h3>
              <p>Status: {user ? '✅ User logged in' : '❌ No user'}</p>
              {user && (
                <>
                  <p>User ID: {user.uid}</p>
                  <p>Email: {user.email}</p>
                  <p>Email Verified: {user.emailVerified ? '✅ Yes' : '❌ No'}</p>
                </>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-purple-700">Auth State:</h3>
              <p>Status: {authState ? '✅ User logged in' : '❌ No user'}</p>
              {authState && (
                <>
                  <p>User ID: {authState.uid}</p>
                  <p>Email: {authState.email}</p>
                  <p>Email Verified: {authState.emailVerified ? '✅ Yes' : '❌ No'}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {user && !user.emailVerified && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Email Verification Actions</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  Your email ({user.email}) is not verified. This is required for Firestore write operations.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSendVerification}
                    disabled={sending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    {sending ? 'Sending...' : 'Send Verification Email'}
                  </button>
                  <button
                    onClick={handleRefreshUser}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    I've Verified
                  </button>
                </div>
              </div>
              
              {sent && (
                <p className="text-green-600">
                  ✅ Verification email sent! Check your inbox (including spam folder).
                </p>
              )}
              
              {error && (
                <p className="text-red-600">
                  ❌ {error}
                </p>
              )}
            </div>
          </div>
        )}

        {user && user.emailVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">✅ Email Verified!</h2>
            <p className="text-green-700">
              Your email is verified. You should now be able to add happy moments without any issues.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Issue:</strong> Email with +1 alias not receiving verification emails</p>
            <p><strong>Solution:</strong> Create a new account with your regular email address (without +1)</p>
            <p><strong>Alternative:</strong> Check spam folder or try resending verification email</p>
            <p><strong>Note:</strong> Firebase sometimes has issues with email aliases containing + symbols</p>
          </div>
        </div>
      </div>
    </div>
  );
} 