// scripts/create-collections.js
// Run this script to create all the collections we need

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'happyme');

async function createCollections() {
  try {
    console.log('Creating collections...');

    // Create groups collection with sample data
    const groupsRef = collection(db, 'groups');
    await addDoc(groupsRef, {
      name: 'Sample Group',
      created_by: 'system',
      created_at: new Date(),
      members: {},
      invite_code: 'SAMPLE123'
    });
    console.log('✅ Created groups collection');

    // Create group_members collection
    const groupMembersRef = collection(db, 'group_members');
    await addDoc(groupMembersRef, {
      group_id: 'sample-group-id',
      user_id: 'sample-user-id',
      joined_at: new Date(),
      role: 'member'
    });
    console.log('✅ Created group_members collection');

    // Create journal_entries collection
    const journalRef = collection(db, 'journal_entries');
    await addDoc(journalRef, {
      user_id: 'sample-user-id',
      content: 'Sample journal entry',
      mood: 'happy',
      created_at: new Date(),
      type: 'manual'
    });
    console.log('✅ Created journal_entries collection');

    // Create user_profiles collection
    const profilesRef = collection(db, 'user_profiles');
    await addDoc(profilesRef, {
      user_id: 'sample-user-id',
      nickname: 'Sample User',
      default_groups: [],
      notification_preferences: {
        group_notifications: true,
        direct_messages: true
      },
      created_at: new Date()
    });
    console.log('✅ Created user_profiles collection');

    // Create notifications collection
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      user_id: 'sample-user-id',
      type: 'group_invite',
      title: 'Sample notification',
      message: 'This is a sample notification',
      read: false,
      created_at: new Date()
    });
    console.log('✅ Created notifications collection');

    // Create messages collection
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, {
      sender_id: 'sample-user-id',
      recipient_id: 'sample-recipient-id',
      group_id: null, // null for direct messages
      content: 'Sample message',
      created_at: new Date(),
      read: false
    });
    console.log('✅ Created messages collection');

    console.log('🎉 All collections created successfully!');
    console.log('You can now delete the sample documents from the Firebase console.');

  } catch (error) {
    console.error('Error creating collections:', error);
    console.error('Error details:', error.message);
  }
}

createCollections(); 