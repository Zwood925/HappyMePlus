import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

export default function EmailVerification() {
  const { user } = useFirebaseAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    if (!user) return;
    
    setSending(true);
    setError('');
    
    try {
      await sendEmailVerification(user);
      setSent(true);
      setTimeout(() => setSent(false), 5000); // Hide success message after 5 seconds
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
      // Force a re-render by updating the auth state
      window.location.reload();
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError('Failed to refresh user status');
    }
  };

  if (!user || user.emailVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address ({user.email}) to access all features.
              Check your inbox for a verification email.
            </p>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              {sending ? 'Sending...' : 'Resend Email'}
            </button>
            <button
              onClick={handleRefreshUser}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              I've Verified
            </button>
          </div>
          {sent && (
            <p className="mt-2 text-sm text-green-600">
              ✅ Verification email sent! Check your inbox.
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">
              ❌ {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 