import React, { useState } from 'react';
import { CheckCircle, Circle, Camera, MapPin, Award, Clock } from 'lucide-react';
import { PhotoUpload } from '../../media/components/PhotoUpload';

interface QuestStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  location_name: string;
  location_id: number;
  latitude: number;
  longitude: number;
  is_completed: boolean;
  photo_url?: string;
  completed_at?: string;
  points_earned?: number;
}

interface QuestProgressProps {
  questId: number;
  questName: string;
  steps: QuestStep[];
  totalPoints: number;
  onStepComplete: (stepId: number, photoFile?: File) => Promise<boolean>;
  onPhotoUpload: (file: File, locationId: number, stepId: number) => Promise<boolean>;
}

export function QuestProgress({ 
  questId, 
  questName, 
  steps, 
  totalPoints, 
  onStepComplete, 
  onPhotoUpload 
}: QuestProgressProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [uploadingStep, setUploadingStep] = useState<number | null>(null);

  const completedSteps = steps.filter(step => step.is_completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStepComplete = async (stepId: number) => {
    setUploadingStep(stepId);
    try {
      const success = await onStepComplete(stepId);
      if (success) {
        setExpandedStep(null);
      }
    } finally {
      setUploadingStep(null);
    }
  };

  const handlePhotoUpload = async (file: File, locationId: number, stepId: number) => {
    try {
      const success = await onPhotoUpload(file, locationId, stepId);
      if (success) {
        // Auto-complete the step after successful photo upload
        await handleStepComplete(stepId);
      }
      return success;
    } catch (error) {
      console.error('Photo upload error:', error);
      return false;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{questName}</h2>
            <p className="text-green-100">Track your progress through the adventure</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalPoints}</div>
            <div className="text-sm opacity-80">total points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{completedSteps} / {steps.length} completed</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Quest Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>~{Math.ceil(steps.length * 0.2)} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{steps.length} locations</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Photo proof required</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg overflow-hidden">
              {/* Step Header */}
              <div 
                className={`p-4 cursor-pointer transition-colors ${
                  step.is_completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.is_completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.is_completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{step.step_number}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.location_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {step.is_completed && step.points_earned && (
                      <div className="text-sm text-green-600 font-medium">
                        +{step.points_earned} pts
                      </div>
                    )}
                    {step.photo_url && (
                      <div className="w-8 h-8 rounded overflow-hidden">
                        <img 
                          src={step.photo_url} 
                          alt="Step photo" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="text-gray-400">
                      {expandedStep === step.id ? '−' : '+'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Details */}
              {expandedStep === step.id && (
                <div className="p-4 border-t bg-white">
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  
                  {step.is_completed ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Step completed!</span>
                      </div>
                      {step.completed_at && (
                        <p className="text-sm text-green-600 mt-1">
                          Completed on {new Date(step.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <PhotoUpload
                        onPhotoUpload={(file) => handlePhotoUpload(file, step.location_id, step.id)}
                        locationId={step.location_id}
                        stepId={step.id}
                        locationName={step.location_name}
                      />
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStepComplete(step.id)}
                          disabled={uploadingStep === step.id}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {uploadingStep === step.id ? 'Completing...' : 'Complete Step'}
                        </button>
                        
                        <button
                          onClick={() => setExpandedStep(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Completion Status */}
        {completedSteps === steps.length && (
          <div className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-6 h-6" />
              <span className="text-lg font-bold">Quest Completed!</span>
            </div>
            <p className="text-sm opacity-90">
              Congratulations! You've completed the {questName} and earned {totalPoints} points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
