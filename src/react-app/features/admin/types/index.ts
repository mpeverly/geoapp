// Admin-specific types

import { Quest, QuestStep, Location } from '../../../shared/types';

export interface AdminStats {
  totalUsers: number;
  totalQuests: number;
  totalLocations: number;
  totalCheckIns: number;
  activeQuests: number;
  completedQuests: number;
}

export interface AdminFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string;
  status?: string;
  userId?: string;
}

export interface QuestFormData {
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
}

export interface QuestStepFormData {
  step_number: number;
  title: string;
  description: string;
  target_location_id?: string;
  required_media: boolean;
  instructions: string;
  points_reward: number;
}

export interface LocationFormData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  is_active: boolean;
}

export interface AdminAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'quest' | 'location' | 'user';
  entityId: string;
  timestamp: string;
  userId: string;
  details: Record<string, any>;
}

export interface AdminPermission {
  canManageQuests: boolean;
  canManageLocations: boolean;
  canManageUsers: boolean;
  canViewStats: boolean;
  canExportData: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  permissions: AdminPermission;
  lastLogin: string;
  isActive: boolean;
}
