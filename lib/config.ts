// lib/config.ts
// Centralized configuration management

// Debug: Log environment variables
console.log('Environment variables check:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');

export const config = {
  // Firebase Configuration
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    priceId: "price_1RTTnrKBklPdPPorQugV6RWU", // Your live price ID
  },

  // Application Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  },

  // Analytics and Monitoring (Optional)
  analytics: {
    gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    sentryDsn: process.env.SENTRY_DSN,
  },
};

// Validation function to ensure required environment variables are set
export function validateConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Helper function to get config with validation
export function getConfig() {
  validateConfig();
  return config;
} 