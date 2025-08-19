import { useState, useEffect } from 'react';
import { config } from '../lib/config';

export default function DebugFirebase() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        config: {
          ...config,
          firebase: {
            ...config.firebase,
            // Mask sensitive values
            apiKey: config.firebase.apiKey ? `${config.firebase.apiKey.substring(0, 10)}...` : 'MISSING',
            appId: config.firebase.appId ? `${config.firebase.appId.substring(0, 10)}...` : 'MISSING'
          }
        }
      };

      // Check environment variables
      info.envVars = {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'MISSING',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : 'MISSING',
      };

      // Test Firebase initialization
      try {
        const { initializeApp, getApps } = await import('firebase/app');
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        info.firebaseInit = {
          config: firebaseConfig,
          apps: getApps().length,
          canInitialize: true
        };

        // Test Firestore
        try {
          const { getFirestore } = await import('firebase/firestore');
          const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
          const db = getFirestore(app);
          
          info.firestore = {
            initialized: true,
            appName: app.name,
            projectId: app.options.projectId
          };
        } catch (firestoreError) {
          info.firestore = {
            initialized: false,
            error: firestoreError instanceof Error ? firestoreError.message : 'Unknown error'
          };
        }

      } catch (initError) {
        info.firebaseInit = {
          canInitialize: false,
          error: initError instanceof Error ? initError.message : 'Unknown error'
        };
      }

      setDebugInfo(info);
      setLoading(false);
    };

    gatherDebugInfo();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Firebase Debug Info</h1>
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Debug Info</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Environment Variables</h2>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy Debug Info
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(debugInfo.envVars || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm">{key}:</span>
                <span className={`font-mono text-sm ${value === 'MISSING' ? 'text-red-600' : 'text-green-600'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debugInfo.config, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Firebase Initialization</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debugInfo.firebaseInit, null, 2)}
          </pre>
        </div>

        {debugInfo.firestore && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Firestore Status</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(debugInfo.firestore, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {debugInfo.envVars && Object.values(debugInfo.envVars).includes('MISSING') && (
              <li className="text-red-600">❌ Missing environment variables detected. Check your .env.local file.</li>
            )}
            {debugInfo.firebaseInit && !debugInfo.firebaseInit.canInitialize && (
              <li className="text-red-600">❌ Firebase initialization failed. Check your configuration.</li>
            )}
            {debugInfo.firestore && !debugInfo.firestore.initialized && (
              <li className="text-red-600">❌ Firestore initialization failed. Check your project settings.</li>
            )}
            {debugInfo.envVars && !Object.values(debugInfo.envVars).includes('MISSING') && 
             debugInfo.firebaseInit && debugInfo.firebaseInit.canInitialize && 
             debugInfo.firestore && debugInfo.firestore.initialized && (
              <li className="text-green-600">✅ All configurations appear correct. The issue might be with Firebase project settings or security rules.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
} 