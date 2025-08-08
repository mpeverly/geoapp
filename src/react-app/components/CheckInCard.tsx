import React, { useState } from 'react';
import { MapPin, Star, Camera, Clock, CheckCircle } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  points_reward: number;
  distance_meters?: number;
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
  const cardClass = isLocation ? 'location-card' : 'business-card';
  const iconColor = isLocation ? 'text-green-600' : 'text-orange-600';
  const buttonColor = isLocation ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700';

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
    <div className={`p-6 ${cardClass} shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPin className={`w-6 h-6 ${iconColor}`} />
          <div>
            <h3 className="text-xl font-bold text-gray-800">{target.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{target.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-gray-700">{target.points_reward}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{target.description}</p>

      {target.distance_meters && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{(target.distance_meters / 1000).toFixed(1)} km away</span>
        </div>
      )}

      <div className="space-y-3">
        {!checkedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={isChecking}
            className={`w-full py-3 px-4 ${buttonColor} text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isChecking ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Check In Here
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-800 rounded-lg font-semibold">
            <CheckCircle className="w-5 h-5" />
            Successfully Checked In!
          </div>
        )}

        {onPhotoUpload && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex items-center justify-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800"
            >
              <Camera className="w-5 h-5" />
              <span>{selectedFile ? selectedFile.name : 'Add Adventure Photo (+5 points)'}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

