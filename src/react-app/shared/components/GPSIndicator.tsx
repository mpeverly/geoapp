import React from 'react';
import { Navigation, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { getAccuracyStatus } from '../utils';

interface GPSIndicatorProps {
  accuracy: number;
  isWatching: boolean;
  error: string | null;
  hasPermission: boolean;
  onRequestPermission?: () => void;
  className?: string;
}

export function GPSIndicator({ 
  accuracy, 
  isWatching, 
  error, 
  hasPermission, 
  onRequestPermission,
  className = '' 
}: GPSIndicatorProps) {
  const accuracyStatus = getAccuracyStatus(accuracy);
  
  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (!hasPermission) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (!isWatching) return <Clock className="w-4 h-4 text-gray-500" />;
    
    switch (accuracyStatus.status) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Navigation className="w-4 h-4 text-blue-500" />;
      case 'fair':
        return <Navigation className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Navigation className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    if (error) return 'GPS Error';
    if (!hasPermission) return 'Location Permission Required';
    if (!isWatching) return 'GPS Inactive';
    return accuracyStatus.message;
  };

  const getTips = () => {
    if (error) return 'Check your device GPS settings';
    if (!hasPermission) return 'Allow location access for accurate check-ins';
    if (!isWatching) return 'GPS monitoring is inactive';
    
    switch (accuracyStatus.status) {
      case 'excellent':
        return 'Perfect! You can check in with confidence';
      case 'good':
        return 'Good accuracy for check-ins';
      case 'fair':
        return 'Move to an open area for better accuracy';
      case 'poor':
        return 'Move outdoors away from buildings for better GPS';
      default:
        return 'Waiting for GPS signal...';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-semibold text-gray-800">GPS Status</span>
        </div>
        <div className="flex items-center space-x-2">
          {isWatching ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {isWatching ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Accuracy:</span>
          <span className={`font-mono text-sm ${accuracyStatus.color}`}>
            {accuracy.toFixed(1)}m
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`text-sm font-medium ${accuracyStatus.color}`}>
            {getStatusMessage()}
          </span>
        </div>

        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          💡 {getTips()}
        </div>

        {!hasPermission && onRequestPermission && (
          <button
            onClick={onRequestPermission}
            className="w-full mt-2 bg-blue-500 text-white text-sm py-2 px-3 rounded hover:bg-blue-600 transition-colors"
          >
            Enable Location Access
          </button>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Accuracy bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Poor</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              accuracyStatus.status === 'excellent' ? 'bg-green-500' :
              accuracyStatus.status === 'good' ? 'bg-blue-500' :
              accuracyStatus.status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(100, Math.max(0, 100 - (accuracy / 100) * 100))}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
