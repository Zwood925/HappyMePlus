const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'happyme');

async function createSamplePrompt() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const promptData = {
      text: "What made you smile today?",
      date: today,
      isActive: true,
      createdAt: Timestamp.now()
    };
    
    const promptsRef = collection(db, 'daily_prompts');
    const docRef = await addDoc(promptsRef, promptData);
    
    console.log('Sample prompt created with ID:', docRef.id);
    console.log('Prompt data:', promptData);
  } catch (error) {
    console.error('Error creating sample prompt:', error);
  }
}

// Run the function
createSamplePrompt();
