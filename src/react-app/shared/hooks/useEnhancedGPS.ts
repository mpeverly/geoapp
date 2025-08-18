import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getCurrentLocation, 
  startGPSMonitoring, 
  stopGPSMonitoring, 
  getGPSState, 
  getBestLocation,
  getAccuracyStatus,
  requestLocationPermission,
  isLocationWithinRadius
} from '../utils';

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface GPSState {
  isWatching: boolean;
  currentLocation: GPSLocation | null;
  accuracyHistory: GPSLocation[];
  lastUpdate: number;
  error: string | null;
}

interface EnhancedGPSReturn {
  // Location data
  location: GPSLocation | null;
  accuracy: number;
  accuracyStatus: ReturnType<typeof getAccuracyStatus>;
  
  // State
  isLoading: boolean;
  isWatching: boolean;
  error: string | null;
  hasPermission: boolean;
  
  // Actions
  getLocation: () => Promise<GPSLocation>;
  startWatching: () => void;
  stopWatching: () => void;
  requestPermission: () => Promise<boolean>;
  
  // Verification
  isWithinRadius: (targetLat: number, targetLon: number, radiusMeters: number) => boolean;
  
  // Debug info
  debugInfo: {
    attempts: number;
    lastUpdate: string;
    historyLength: number;
  };
}

export function useEnhancedGPS(autoStart: boolean = true): EnhancedGPSReturn {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    attempts: 0,
    lastUpdate: '',
    historyLength: 0
  });

  const attemptsRef = useRef(0);
  const gpsStateRef = useRef<GPSState | null>(null);

  // Get GPS state periodically
  useEffect(() => {
    const updateGPSState = () => {
      const state = getGPSState();
      gpsStateRef.current = state;
      
      if (state.currentLocation) {
        // Debug logging for GPS coordinates
        console.log('GPS Hook Debug:');
        console.log(`Received coordinates: ${state.currentLocation.latitude}, ${state.currentLocation.longitude}`);
        console.log(`Accuracy: ${state.currentLocation.accuracy}m`);
        console.log(`Timestamp: ${new Date(state.currentLocation.timestamp).toLocaleTimeString()}`);
        
        setLocation(state.currentLocation);
      }
      
      setDebugInfo({
        attempts: attemptsRef.current,
        lastUpdate: new Date(state.lastUpdate).toLocaleTimeString(),
        historyLength: state.accuracyHistory.length
      });
    };

    const interval = setInterval(updateGPSState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-start GPS monitoring
  useEffect(() => {
    if (autoStart) {
      startWatching();
    }
    
    return () => {
      stopWatching();
    };
  }, [autoStart]);

  const getLocation = useCallback(async (): Promise<GPSLocation> => {
    setIsLoading(true);
    setError(null);
    attemptsRef.current = 0;

    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
        minAccuracy: 10, // Require 10 meters or better
        maxAttempts: 5
      });

      setLocation(location);
      setError(null);
      return location;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startWatching = useCallback(() => {
    try {
      startGPSMonitoring({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000
      });
      setError(null);
    } catch (err) {
      setError('Failed to start GPS monitoring');
    }
  }, []);

  const stopWatching = useCallback(() => {
    stopGPSMonitoring();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestLocationPermission();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      setHasPermission(false);
      return false;
    }
  }, []);

  const isWithinRadius = useCallback((
    targetLat: number, 
    targetLon: number, 
    radiusMeters: number
  ): boolean => {
    if (!location) return false;
    
    return isLocationWithinRadius(
      location.latitude,
      location.longitude,
      targetLat,
      targetLon,
      radiusMeters,
      location.accuracy
    );
  }, [location]);

  // Calculate accuracy status
  const accuracyStatus = location ? getAccuracyStatus(location.accuracy) : {
    status: 'poor' as const,
    message: 'No location data',
    color: 'text-gray-600'
  };

  // Get current watching state
  const isWatching = gpsStateRef.current?.isWatching || false;

  return {
    location,
    accuracy: location?.accuracy || 999,
    accuracyStatus,
    isLoading,
    isWatching,
    error,
    hasPermission,
    getLocation,
    startWatching,
    stopWatching,
    requestPermission,
    isWithinRadius,
    debugInfo
  };
}
