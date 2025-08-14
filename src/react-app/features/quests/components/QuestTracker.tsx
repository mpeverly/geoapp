import { useState } from 'react';
import { 
  Target, 
  Camera, 
  CheckCircle, 
  Clock, 
  Award, 
  MapPin, 
  Upload, 
  X,
  Play,
  Calendar,
  BarChart3,
  Trophy
} from 'lucide-react';

interface QuestStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  step_type: string;
  points_reward: number;
  location_name?: string;
}

interface Quest {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  steps?: QuestStep[];
  isStarted?: boolean;
  steps_completed?: number;
  steps_required?: number;
  isCompleted?: boolean;
  progress?: any;
}

interface QuestTrackerProps {
  userQuests: Quest[];
  onCompleteStep: (questId: number, stepNumber: number) => void;
  onUploadPhoto: (questId: number, stepNumber: number, file: File) => void;
}

export function QuestTracker({ userQuests, onCompleteStep, onUploadPhoto }: QuestTrackerProps): JSX.Element {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState<{[key: string]: File}>({});

  const handlePhotoUpload = (questId: number, stepNumber: number, file: File) => {
    setUploadingPhotos(prev => ({
      ...prev,
      [`${questId}-${stepNumber}`]: file
    }));
    onUploadPhoto(questId, stepNumber, file);
  };

  const removePhoto = (questId: number, stepNumber: number) => {
    setUploadingPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[`${questId}-${stepNumber}`];
      return newPhotos;
    });
  };

  const getProgressPercentage = (quest: Quest) => {
    if (!quest.steps_completed || !quest.steps_required) return 0;
    return Math.round((quest.steps_completed / quest.steps_required) * 100);
  };

  const getTimeElapsed = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getEstimatedTimeRemaining = (quest: Quest) => {
    if (!quest.steps_completed || !quest.steps_required) return 'Unknown';
    const completed = quest.steps_completed;
    const total = quest.steps_required;
    const remaining = total - completed;
    // Estimate 15 minutes per step
    const minutes = remaining * 15;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (userQuests.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Quest Tracker</h2>
            <p className="text-lg opacity-90">Track your progress and complete epic adventures</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Quests</h3>
          <p className="text-gray-600 mb-6">Start a quest from the Quests tab to begin tracking your progress</p>
          <button
            onClick={() => window.location.hash = '#quests'}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse Quests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quest Tracker Hero */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Quest Tracker</h2>
          <p className="text-lg opacity-90 mb-6">Track your progress and complete epic adventures</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>{userQuests.length} active quests</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>{userQuests.reduce((sum, q) => sum + (q.steps_completed || 0), 0)} steps completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>{userQuests.filter(q => q.isCompleted).length} quests finished</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quest List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userQuests.map((quest) => (
          <div
            key={quest.id}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
              selectedQuest?.id === quest.id ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
            }`}
            onClick={() => setSelectedQuest(quest)}
          >
            {/* Quest Header */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{quest.name}</h3>
                    <div className="flex items-center gap-1 text-blue-100 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>Started {quest.progress?.startedAt ? getTimeElapsed(quest.progress.startedAt) : 'recently'} ago</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{quest.points_reward}</div>
                  <div className="text-xs opacity-80">points</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{quest.steps_completed || 0} / {quest.steps_required || 0}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(quest)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quest Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Est. {getEstimatedTimeRemaining(quest)} remaining</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{getProgressPercentage(quest)}% complete</span>
                </div>
              </div>
            </div>

            {/* Quest Status */}
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {quest.isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-semibold">Completed!</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-600 font-semibold">In Progress</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {quest.steps_completed || 0} of {quest.steps_required || 0} steps
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Quest Details */}
      {selectedQuest && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{selectedQuest.name}</h3>
            <button
              onClick={() => setSelectedQuest(null)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quest Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quest Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">{selectedQuest.description}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Points Reward</span>
                    <span className="font-semibold">{selectedQuest.points_reward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="font-semibold">{getProgressPercentage(selectedQuest)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Elapsed</span>
                    <span className="font-semibold">
                      {selectedQuest.progress?.startedAt ? getTimeElapsed(selectedQuest.progress.startedAt) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Est. Time Remaining</span>
                    <span className="font-semibold">{getEstimatedTimeRemaining(selectedQuest)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quest Steps */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-gray-900 mb-4">Quest Steps</h4>
              <div className="space-y-4">
                {selectedQuest.steps?.map((step) => {
                  const isCompleted = selectedQuest.progress?.completedSteps?.includes(step.step_number);
                  const hasPhoto = uploadingPhotos[`${selectedQuest.id}-${step.step_number}`];
                  
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.step_number}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{step.title}</h5>
                              <p className="text-sm text-gray-600">{step.description}</p>
                              {step.location_name && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{step.location_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isCompleted && (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handlePhotoUpload(selectedQuest.id, step.step_number, file);
                                  }
                                }}
                                className="hidden"
                                id={`photo-${selectedQuest.id}-${step.step_number}`}
                              />
                              <label
                                htmlFor={`photo-${selectedQuest.id}-${step.step_number}`}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                                title="Upload Photo"
                              >
                                <Camera className="w-4 h-4" />
                              </label>
                              <button
                                onClick={() => onCompleteStep(selectedQuest.id, step.step_number)}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                title="Complete Step"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {hasPhoto && (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Upload className="w-4 h-4 text-blue-600" />
                              </div>
                              <button
                                onClick={() => removePhoto(selectedQuest.id, step.step_number)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">{step.points_reward}</div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
