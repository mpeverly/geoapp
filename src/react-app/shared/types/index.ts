// Shared types used across multiple features

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  avatar?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  estimated_time: number;
  category: string;
  requirements: string;
  instructions: string;
  max_participants: number;
  start_date?: string;
  end_date?: string;
  location_area: string;
  tags: string;
  media_urls: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestStep {
  id: string;
  quest_id: string;
  step_number: number;
  title: string;
  description: string;
  target_location_id?: string;
  required_media: boolean;
  instructions: string;
  points_reward: number;
  created_at: string;
  updated_at: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
  total_steps: number;
  completed_steps: number;
}

export interface UserQuestStep {
  id: string;
  user_quest_id: string;
  quest_step_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: string;
  photo_url?: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  criteria: string;
  is_active: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface FormData {
  [key: string]: any;
}

// File upload types
export interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  uploaded_at: string;
}

// Geolocation types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// UI State types
export type TabType = 'explore' | 'quests' | 'quest-tracker' | 'profile' | 'leaderboard' | 'admin';

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Theme types
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warning: string;
  error: string;
}
