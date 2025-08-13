import React from 'react';
import {
  Trophy,
  Star,
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Zap,
  Mountain,
  Camera,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

interface Quest {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  is_active: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimated_time?: number;
  steps_required?: number;
  steps_completed?: number;
  category?: string;
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exploration': return <Mountain className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'photography': return <Camera className="w-4 h-4" />;
      case 'fitness': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'exploration': return 'text-green-600 bg-green-50 border-green-200';
      case 'social': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'photography': return 'text-green-600 bg-green-50 border-green-200';
      case 'fitness': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="w-8 h-8 text-yellow-300" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{questData.name}</h3>
                {userQuest && (
                  <p className="text-sm opacity-90 capitalize">{userQuest.status}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{questData.points_reward}</span>
            </div>
          </div>

          {/* Quest metadata */}
          <div className="flex items-center gap-4 text-sm">
            {questData.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(questData.difficulty)}`}>
                {questData.difficulty.toUpperCase()}
              </span>
            )}
            {questData.estimated_time && (
              <div className="flex items-center gap-1 opacity-90">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(questData.estimated_time / 60)}m</span>
              </div>
            )}
            {questData.category && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getCategoryColor(questData.category)}`}>
                {getCategoryIcon(questData.category)}
                <span className="text-xs font-medium">{questData.category}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-700 mb-6 leading-relaxed">{questData.description}</p>

        {/* Progress bar */}
        {userQuest && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span className="font-medium">Progress</span>
              <span>{userQuest.completed_steps}/{userQuest.total_steps} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Started {new Date(userQuest.started_at).toLocaleDateString()}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        )}

        {/* Quest steps */}
        {questSteps && questSteps.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              Quest Steps
            </h4>
            {questSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-300">
                  <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{step.title}</span>
                    <span className="text-sm font-medium text-green-600">+{step.points_reward} pts</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  {(step.location_name || step.business_name) && (
                    <div className="flex items-center gap-1">
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

        {/* Action buttons */}
        {!isStarted && !userQuest && onStartQuest && (
          <button
            onClick={() => onStartQuest(questData.id)}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Trophy className="w-5 h-5" />
            Start Quest
          </button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold">
            <CheckCircle2 className="w-6 h-6" />
            <span>Quest Completed!</span>
            <Award className="w-5 h-5" />
          </div>
        )}

        {userQuest && userQuest.status === 'active' && !isCompleted && (
          <div className="text-center py-4 px-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Quest in Progress</span>
            </div>
            <p className="text-sm text-green-600">
              Complete the steps above to earn {questData.points_reward} points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

