import { useEffect } from 'react';

export default function TestEnv() {
  useEffect(() => {
    console.log('=== ENVIRONMENT VARIABLES TEST ===');
    console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : 'NOT SET');
    console.log('=====================================');
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Environment Variables Test</h1>
      <p>Check the browser console for environment variable status.</p>
      <div>
        <h3>Firebase Config Status:</h3>
        <ul>
          <li>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ SET' : '❌ NOT SET'}</li>
          <li>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ SET' : '❌ NOT SET'}</li>
          <li>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ SET' : '❌ NOT SET'}</li>
          <li>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ SET' : '❌ NOT SET'}</li>
          <li>Messaging Sender ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ SET' : '❌ NOT SET'}</li>
          <li>App ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ SET' : '❌ NOT SET'}</li>
        </ul>
      </div>
    </div>
  );
} 