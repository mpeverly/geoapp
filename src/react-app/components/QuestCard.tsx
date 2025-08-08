import React from 'react';
import { Trophy, Star, MapPin, CheckCircle2, Circle } from 'lucide-react';

interface Quest {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  is_active: boolean;
}

interface QuestStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  step_type: string;
  points_reward: number;
  location_name?: string;
  business_name?: string;
}

interface UserQuest {
  id: number;
  quest_id: number;
  status: string;
  completed_steps: number;
  total_steps: number;
  started_at: string;
  completed_at?: string;
  name: string;
  description: string;
  points_reward: number;
}

interface QuestCardProps {
  quest?: Quest;
  userQuest?: UserQuest;
  questSteps?: QuestStep[];
  onStartQuest?: (questId: number) => void;
  isStarted?: boolean;
}

export function QuestCard({ quest, userQuest, questSteps, onStartQuest, isStarted }: QuestCardProps) {
  const questData = quest || {
    id: userQuest!.quest_id,
    name: userQuest!.name,
    description: userQuest!.description,
    points_reward: userQuest!.points_reward,
    is_active: true
  };

  const progress = userQuest ? (userQuest.completed_steps / userQuest.total_steps) * 100 : 0;
  const isCompleted = userQuest?.status === 'completed';

  return (
    <div className="quest-card p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">{questData.name}</h3>
            {userQuest && (
              <p className="text-sm text-gray-600 capitalize">{userQuest.status}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-gray-700">{questData.points_reward}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{questData.description}</p>

      {userQuest && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{userQuest.completed_steps}/{userQuest.total_steps} steps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {questSteps && questSteps.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="font-semibold text-gray-800">Quest Steps:</h4>
          {questSteps.map((step) => (
            <div key={step.id} className="flex items-center gap-3 p-2 bg-white rounded border">
              <Circle className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{step.title}</span>
                  <span className="text-sm text-gray-500">+{step.points_reward} pts</span>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
                {(step.location_name || step.business_name) && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {step.location_name || step.business_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isStarted && !userQuest && onStartQuest && (
        <button
          onClick={() => onStartQuest(questData.id)}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          Start Quest
        </button>
      )}

      {isCompleted && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-800 rounded-lg font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Quest Completed!
        </div>
      )}

      {userQuest && userQuest.status === 'active' && !isCompleted && (
        <div className="text-center py-2 text-gray-600">
          Quest in progress... Complete the steps above to earn {questData.points_reward} points!
        </div>
      )}
    </div>
  );
}

