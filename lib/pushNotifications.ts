import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './firebase';

// Initialize Firebase messaging only in browser
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase messaging not supported in this browser');
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Get FCM token for push notifications
export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging) {
      console.log('Firebase messaging not available');
      return null;
    }

    const permission = await requestNotificationPermission();
    if (!permission) {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Show local notification
export function showLocalNotification(payload: PushNotificationPayload): void {
  try {
    if (Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: false,
      silent: false
    });

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      notification.close();
      
      // Focus the window
      if (window.focus) {
        window.focus();
      }
      
      // Navigate to the app or specific page
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      }
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

  } catch (error) {
    console.error('Error showing local notification:', error);
  }
}

// Update app badge count
export function updateAppBadge(count: number): void {
  try {
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(count);
    }
  } catch (error) {
    console.error('Error updating app badge:', error);
  }
}

// Clear app badge
export function clearAppBadge(): void {
  try {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge();
    }
  } catch (error) {
    console.error('Error clearing app badge:', error);
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void): () => void {
  if (!messaging) {
    console.log('Firebase messaging not available');
    return () => {}; // Return empty unsubscribe function
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show local notification
    if (payload.notification) {
      showLocalNotification({
        title: payload.notification.title || 'New Notification',
        body: payload.notification.body || '',
        data: payload.data
      });
    }
    
    // Update badge count
    if (payload.data?.badgeCount) {
      updateAppBadge(parseInt(payload.data.badgeCount));
    }
    
    // Call the callback
    callback(payload);
  });
}

// Initialize push notification service
export async function initializePushNotifications(): Promise<void> {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    // Get FCM token
    const token = await getFCMToken();
    if (token) {
      // Store token in user profile for server-side notifications
      // This will be handled by the user profile system
      console.log('Push notification token obtained:', token);
    }

    // Set up foreground message listener
    onForegroundMessage((payload) => {
      console.log('Received foreground message:', payload);
    });

  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}

// Send test notification
export function sendTestNotification(): void {
  showLocalNotification({
    title: 'Test Notification',
    body: 'This is a test notification from HappyMe+',
    icon: '/favicon.ico',
    tag: 'test-notification'
  });
}
