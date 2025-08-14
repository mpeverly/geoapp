// Example component demonstrating the new feature-based structure

import React from 'react';
import { Quest, QuestProgress } from '../../../shared/types';
import { useQuests } from '../hooks/useQuests';
import { QuestCompletionData } from '../types';

interface QuestExampleProps {
  questId: string;
}

export default function QuestExample({ questId }: QuestExampleProps) {
  const {
    quests,
    selectedQuest,
    userQuests,
    questsLoading,
    handleStartQuest,
    handleCompleteStep,
    getQuestProgress,
  } = useQuests();

  const quest = quests.find(q => q.id === questId);
  const progress = getQuestProgress(questId);

  if (questsLoading) {
    return <div>Loading quests...</div>;
  }

  if (!quest) {
    return <div>Quest not found</div>;
  }

  const handleStart = () => {
    handleStartQuest(questId);
  };

  const handleCompleteStepExample = () => {
    const completionData: QuestCompletionData = {
      questId,
      stepNumber: 1,
      photoUrl: 'https://example.com/photo.jpg',
      coordinates: {
        latitude: 43.6532,
        longitude: -79.3832,
      },
    };
    handleCompleteStep(completionData);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">{quest.name}</h2>
      <p className="mb-4">{quest.description}</p>
      
      {progress ? (
        <div className="mb-4">
          <p>Progress: {progress.completedSteps}/{progress.totalSteps}</p>
          <p>Status: {progress.status}</p>
          {progress.startedAt && (
            <p>Started: {new Date(progress.startedAt).toLocaleDateString()}</p>
          )}
        </div>
      ) : (
        <p className="mb-4">Not started yet</p>
      )}

      <div className="space-x-2">
        {!progress && (
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Start Quest
          </button>
        )}
        
        {progress && progress.status === 'in_progress' && (
          <button
            onClick={handleCompleteStepExample}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Complete Step Example
          </button>
        )}
      </div>
    </div>
  );
}
