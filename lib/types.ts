// lib/types.ts
// Centralized type definitions for the application

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  nickname?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

// Happy Moments Types
export interface HappyMoment {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Encouragement Types
export interface Encouragement {
  id: number;
  content: string;
  sender_id?: string;
  receiver_id?: string;
  group_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface EncouragementTemplate {
  id: number;
  content: string;
  category?: string;
}

// Group Types
export interface Group {
  id: number;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

// Journal Types
export interface JournalEntry {
  id: number;
  user_id: string;
  content: string;
  mood?: number; // 1-10 scale
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  nickname?: string;
}

export interface HappyMomentForm {
  content: string;
}

export interface EncouragementForm {
  content: string;
  receiver_id?: string;
  group_id?: number;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
} 