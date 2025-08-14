// Quest-specific types

import { Quest, QuestStep, UserQuest, UserQuestStep } from '../../../shared/types';

export interface QuestFilters {
  difficulty?: string;
  category?: string;
  location?: string;
  maxTime?: number;
  isActive?: boolean;
}

export interface QuestSearchParams {
  query?: string;
  filters?: QuestFilters;
  page?: number;
  limit?: number;
}

export interface QuestProgress {
  questId: string;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  startedAt?: string;
  completedAt?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
}

export interface QuestStepWithProgress extends QuestStep {
  isCompleted: boolean;
  photoUrl?: string;
  completedAt?: string;
}

export interface QuestWithSteps extends Quest {
  steps: QuestStep[];
  userProgress?: QuestProgress;
}

export interface QuestCompletionData {
  questId: string;
  stepNumber: number;
  photoUrl?: string;
  notes?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface QuestReward {
  points: number;
  experience: number;
  achievements?: string[];
  items?: string[];
}

export interface QuestValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  steps: Omit<QuestStep, 'id' | 'quest_id' | 'created_at' | 'updated_at'>[];
}
