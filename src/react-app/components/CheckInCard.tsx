import React, { useState } from 'react';
import { 
  MapPin, 
  Star, 
  Camera, 
  Clock, 
  CheckCircle, 
  Navigation,
  Zap,
  Award,
  Sparkles,
  Target,
  Heart
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  points_reward: number;
  distance_meters?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimated_time?: number;
}

interface BusinessPartner {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  points_reward: number;
  distance_meters?: number;
  special_offer?: string;
}

interface CheckInCardProps {
  location?: Location;
  business?: BusinessPartner;
  userLocation?: { lat: number; lng: number };
  onCheckIn: (lat: number, lng: number, locationId?: number, businessId?: number) => Promise<any>;
  onPhotoUpload?: (file: File) => void;
}

export function CheckInCard({ location, business, userLocation, onCheckIn, onPhotoUpload }: CheckInCardProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const target = location || business;
  if (!target) return null;

  const isLocation = !!location;
  const iconColor = isLocation ? 'text-green-600' : 'text-orange-600';
  const gradientFrom = isLocation ? 'from-green-500' : 'from-orange-500';
  const gradientTo = isLocation ? 'to-emerald-600' : 'to-red-600';
  const buttonGradient = isLocation ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-600';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCheckIn = async () => {
    if (!userLocation) {
      alert('Location access required for check-in');
      return;
    }

    setIsChecking(true);
    try {
      const result = await onCheckIn(
        userLocation.lat,
        userLocation.lng,
        isLocation ? target.id : undefined,
        !isLocation ? target.id : undefined
      );
      
      if (result.verified) {
        setCheckedIn(true);
      } else {
        alert('Check-in failed: You may be too far from the location');
      }
    } catch (error) {
      alert('Check-in failed. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPhotoUpload) {
      setSelectedFile(file);
      onPhotoUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                {isLocation ? (
                  <MapPin className="w-8 h-8 text-white" />
                ) : (
                  <Target className="w-8 h-8 text-white" />
                )}
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{target.name}</h3>
                <p className="text-sm opacity-90 capitalize">{target.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{target.points_reward}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm">
            {location?.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(location.difficulty)}`}>
                {location.difficulty.toUpperCase()}
              </span>
            )}
            {location?.estimated_time && (
              <div className="flex items-center gap-1 opacity-90">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(location.estimated_time / 60)}m</span>
              </div>
            )}
            {business?.special_offer && (
              <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                <Award className="w-3 h-3 text-yellow-300" />
                <span className="text-xs font-medium">{business.special_offer}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-700 mb-6 leading-relaxed">{target.description}</p>

        {/* Distance and location info */}
        {target.distance_meters && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-800">Distance</p>
              <p className="text-sm text-blue-600">{(target.distance_meters / 1000).toFixed(1)} km away</p>
            </div>
          </div>
        )}

        {/* Check-in button */}
        <div className="space-y-4">
          {!checkedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={isChecking}
              className={`w-full py-4 px-6 bg-gradient-to-r ${buttonGradient} text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
            >
              {isChecking ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Check In Here
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold">
              <CheckCircle className="w-6 h-6" />
              <span>Successfully Checked In!</span>
              <Award className="w-5 h-5" />
            </div>
          )}

          {/* Photo upload */}
          {onPhotoUpload && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center gap-3 cursor-pointer text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">
                    {selectedFile ? selectedFile.name : 'Add Adventure Photo'}
                  </p>
                  <p className="text-sm text-gray-500">+5 points for sharing your adventure</p>
                </div>
              </label>
            </div>
          )}

          {/* Rewards preview */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-yellow-800">Rewards Available</p>
                <p className="text-sm text-yellow-700">
                  {target.points_reward} points for check-in
                  {onPhotoUpload && ' + 5 points for photo'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

