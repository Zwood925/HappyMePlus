// scripts/create-collections-simple.js
// Simple version with hardcoded config

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Hardcoded Firebase config (replace with your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyB1AT4R6ErSui1tZ5uksCZjaHZWYd1DZ6Y",
  authDomain: "happyme-3846e.firebaseapp.com",
  projectId: "happyme-3846e",
  storageBucket: "happyme-3846e.firebasestorage.app",
  messagingSenderId: "300420832704",
  appId: "1:300420832704:web:4136a8a315121f79ecbc25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'happyme');

async function createCollections() {
  try {
    console.log('Creating collections with hardcoded config...');

    // Create groups collection
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
      group_id: null,
      content: 'Sample message',
      created_at: new Date(),
      read: false
    });
    console.log('✅ Created messages collection');

    console.log('🎉 All collections created successfully!');

  } catch (error) {
    console.error('Error creating collections:', error);
    console.error('Error details:', error.message);
  }
}

createCollections(); 