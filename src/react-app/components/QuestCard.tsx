import { MapPin, Camera, Award, Target, Clock, Users, Sparkles } from 'lucide-react';

interface Quest {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  is_active: boolean;
  steps_required?: number;
  steps_completed?: number;
  category?: string;
  steps?: any[];
}

interface QuestCardProps {
  quest: Quest;
  onStartQuest: () => void;
  isStarted: boolean;
  onCompleteStep?: (stepNumber: number) => void;
}

export function QuestCard({ quest, onStartQuest, isStarted, onCompleteStep }: QuestCardProps) {
  const isMeredithSculptureWalk = quest.name === 'Meredith Sculpture Walk';
  
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
      case 'sculpture': return <MapPin className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'checkin': return <Target className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sculpture': return 'from-green-500 to-emerald-600';
      case 'photo': return 'from-blue-500 to-cyan-600';
      case 'checkin': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
      isMeredithSculptureWalk ? 'border-green-500 shadow-green-100' : 'border-gray-200'
    }`}>
      {/* Header with gradient */}
      <div className={`p-6 bg-gradient-to-r ${isMeredithSculptureWalk ? 'from-green-500 to-emerald-600' : 'from-purple-500 to-pink-600'} text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {isMeredithSculptureWalk ? <Sparkles className="w-5 h-5" /> : <Award className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">{quest.name}</h3>
              {isMeredithSculptureWalk && (
                <div className="flex items-center gap-1 text-green-100 text-sm">
                  <MapPin className="w-3 h-3" />
                  <span>Downtown Meredith, NH</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{quest.points_reward}</div>
            <div className="text-xs opacity-80">points</div>
          </div>
        </div>
        
        <p className="text-sm leading-relaxed opacity-90">{quest.description}</p>
        
        {/* Quest metadata */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>~2-3 hours</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>10 sculptures</span>
          </div>
          <div className="flex items-center gap-1">
            <Camera className="w-4 h-4" />
            <span>Photo required</span>
          </div>
        </div>
      </div>

      {/* Quest steps preview */}
      {isStarted && quest.steps && (
        <div className="p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Quest Progress
          </h4>
          <div className="space-y-2">
            {quest.steps.slice(0, 3).map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.location_name}</div>
                </div>
                <button
                  onClick={() => onCompleteStep?.(step.step_number)}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                >
                  Complete
                </button>
              </div>
            ))}
            {quest.steps.length > 3 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{quest.steps.length - 3} more steps...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="p-6">
        {!isStarted ? (
          <button
            onClick={onStartQuest}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
              isMeredithSculptureWalk 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
            }`}
          >
            {isMeredithSculptureWalk ? '🚀 Start Meredith Adventure' : 'Start Quest'}
          </button>
        ) : (
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Quest in progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(quest.steps_completed || 0) / (quest.steps_required || 1) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {quest.steps_completed || 0} / {quest.steps_required || 1} completed
            </div>
          </div>
        )}
      </div>

      {/* Special badge for Meredith Sculpture Walk */}
      {isMeredithSculptureWalk && (
        <div className="absolute top-4 right-4">
          <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            🌟 FEATURED
          </div>
        </div>
      )}
    </div>
  );
}

