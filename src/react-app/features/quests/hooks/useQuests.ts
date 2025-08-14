// Quest-specific hooks

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage, useApi } from '../../../shared/hooks';
import { Quest, QuestStep } from '../../../shared/types';
import { QuestProgress, QuestWithSteps, QuestCompletionData } from '../types';

// API functions
const fetchQuests = async (): Promise<Quest[]> => {
  const response = await fetch('/api/quests');
  if (!response.ok) throw new Error('Failed to fetch quests');
  return response.json();
};

const fetchQuest = async (id: string): Promise<QuestWithSteps> => {
  const response = await fetch(`/api/quests/${id}`);
  if (!response.ok) throw new Error('Failed to fetch quest');
  return response.json();
};

const startQuest = async (questId: string): Promise<void> => {
  const response = await fetch(`/api/quests/${questId}/start`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to start quest');
};

const completeQuestStep = async (data: QuestCompletionData): Promise<void> => {
  const response = await fetch(`/api/quests/${data.questId}/complete-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to complete quest step');
};

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<QuestWithSteps | null>(null);
  const [userQuests, setUserQuests] = useLocalStorage<QuestProgress[]>('userQuests', []);

  const { data: questsData, error: questsError, isLoading: questsLoading, execute: fetchQuestsData } = useApi(fetchQuests);

  const { data: questData, error: questError, isLoading: questLoading, execute: fetchQuestData } = useApi(fetchQuest);

  const { error: startError, isLoading: startLoading, execute: startQuestData } = useApi(startQuest);

  const { error: completeError, isLoading: completeLoading, execute: completeStepData } = useApi(completeQuestStep);

  // Load quests on mount
  useEffect(() => {
    fetchQuestsData();
  }, [fetchQuestsData]);

  // Update quests when data changes
  useEffect(() => {
    if (questsData) {
      setQuests(questsData);
    }
  }, [questsData]);

  // Update selected quest when data changes
  useEffect(() => {
    if (questData) {
      setSelectedQuest(questData);
    }
  }, [questData]);

  const loadQuest = useCallback((questId: string) => {
    fetchQuestData(questId);
  }, [fetchQuestData]);

  const handleStartQuest = useCallback(async (questId: string) => {
    try {
      await startQuestData(questId);
      
      // Update local storage
      const quest = quests.find(q => q.id === questId);
      if (quest) {
        const newProgress: QuestProgress = {
          questId,
          totalSteps: 0, // Will be updated when quest loads
          completedSteps: 0,
          progressPercentage: 0,
          startedAt: new Date().toISOString(),
          status: 'in_progress'
        };
        
        setUserQuests(prev => {
          const existing = prev.find(p => p.questId === questId);
          if (existing) return prev;
          return [...prev, newProgress];
        });
      }
    } catch (error) {
      console.error('Failed to start quest:', error);
    }
  }, [startQuestData, quests, setUserQuests]);

  const handleCompleteStep = useCallback(async (data: QuestCompletionData) => {
    try {
      await completeStepData(data);
      
      // Update local storage
      setUserQuests(prev => {
        const questProgress = prev.find(p => p.questId === data.questId);
        if (!questProgress) return prev;
        
        const updatedProgress = {
          ...questProgress,
          completedSteps: questProgress.completedSteps + 1,
          progressPercentage: Math.round(((questProgress.completedSteps + 1) / questProgress.totalSteps) * 100)
        };
        
        if (updatedProgress.completedSteps >= updatedProgress.totalSteps) {
          updatedProgress.status = 'completed';
          updatedProgress.completedAt = new Date().toISOString();
        }
        
        return prev.map(p => p.questId === data.questId ? updatedProgress : p);
      });
    } catch (error) {
      console.error('Failed to complete quest step:', error);
    }
  }, [completeStepData, setUserQuests]);

  const getQuestProgress = useCallback((questId: string): QuestProgress | undefined => {
    return userQuests.find(p => p.questId === questId);
  }, [userQuests]);

  const getActiveQuests = useCallback(() => {
    return userQuests.filter(p => p.status === 'in_progress');
  }, [userQuests]);

  const getCompletedQuests = useCallback(() => {
    return userQuests.filter(p => p.status === 'completed');
  }, [userQuests]);

  const abandonQuest = useCallback((questId: string) => {
    setUserQuests(prev => 
      prev.map(p => 
        p.questId === questId 
          ? { ...p, status: 'abandoned' as const }
          : p
      )
    );
  }, [setUserQuests]);

  const resetQuest = useCallback((questId: string) => {
    setUserQuests(prev => 
      prev.filter(p => p.questId !== questId)
    );
  }, [setUserQuests]);

  return {
    // State
    quests,
    selectedQuest,
    userQuests,
    
    // Loading states
    questsLoading,
    questLoading,
    startLoading,
    completeLoading,
    
    // Errors
    questsError,
    questError,
    startError,
    completeError,
    
    // Actions
    loadQuest,
    handleStartQuest,
    handleCompleteStep,
    getQuestProgress,
    getActiveQuests,
    getCompletedQuests,
    abandonQuest,
    resetQuest,
    
    // Refresh
    refreshQuests: fetchQuestsData,
  };
}
