// lib/constants.ts
// Application-wide constants

// App Configuration
export const APP_CONFIG = {
  name: 'HappyMePlus',
  version: '1.0.0',
  description: 'Mental wellness app for tracking happy moments and receiving encouragement',
  maxContentLength: 1000,
  maxNicknameLength: 50,
  defaultPageSize: 20,
} as const;

// Routes
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  settings: '/settings',
  encouragements: '/encouragements',
  journal: '/journal',
  groups: '/groups',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // API endpoints will be added here as needed
} as const;

// Database Table Names
export const TABLES = {
  profiles: 'profiles',
  happy_moments: 'happy_moments',
  encouragements: 'encouragements',
  groups: 'groups',
  group_members: 'group_members',
  journal_entries: 'journal_entries',
} as const;

// User Roles
export const USER_ROLES = {
  admin: 'admin',
  member: 'member',
} as const;



// Mood Scale
export const MOOD_SCALE = {
  min: 1,
  max: 10,
  labels: {
    1: 'Very Sad',
    2: 'Sad',
    3: 'Down',
    4: 'Low',
    5: 'Neutral',
    6: 'Okay',
    7: 'Good',
    8: 'Happy',
    9: 'Very Happy',
    10: 'Ecstatic',
  },
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'happymeplus-theme',
  userPreferences: 'happymeplus-preferences',
  lastVisit: 'happymeplus-last-visit',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  emailInvalid: 'Please enter a valid email address.',
  passwordTooShort: 'Password must be at least 6 characters long.',
  contentTooLong: 'Content is too long. Please keep it under 1000 characters.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  momentSaved: 'Happy moment saved successfully!',
  encouragementSent: 'Encouragement sent successfully!',
  profileUpdated: 'Profile updated successfully!',
  groupJoined: 'Successfully joined the group!',
  groupCreated: 'Group created successfully!',
} as const;

// Default Encouragement Messages
export const DEFAULT_ENCOURAGEMENTS = [
  "You're doing great! Keep going!",
  "Every day is a new opportunity to shine!",
  "You have the strength to overcome any challenge!",
  "Your positive attitude is inspiring!",
  "Remember, you are capable of amazing things!",
  "Take it one step at a time - you've got this!",
  "Your resilience is admirable!",
  "You make a difference in the world!",
  "Believe in yourself - you're stronger than you know!",
  "Today is your day to shine!",
] as const;

// Color Themes
export const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const; 