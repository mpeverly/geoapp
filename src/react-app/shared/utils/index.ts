// Shared utility functions used across multiple features

import { Coordinates } from '../types';

/**
 * Enhanced GPS location utilities for high accuracy
 */

interface GPSOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  minAccuracy?: number; // Minimum accuracy in meters
  maxAttempts?: number; // Maximum attempts to get accurate location
  continuous?: boolean; // Whether to continuously monitor location
}

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

// Global GPS state for continuous monitoring
let gpsState: GPSState = {
  isWatching: false,
  currentLocation: null,
  accuracyHistory: [],
  lastUpdate: 0,
  error: null
};

let watchId: number | null = null;

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get the most accurate location from history
 */
function getMostAccurateLocation(history: GPSLocation[]): GPSLocation | null {
  if (history.length === 0) return null;
  
  // Sort by accuracy (lower is better) and recency
  const sorted = history.sort((a, b) => {
    // Prioritize accuracy, then recency
    const accuracyDiff = a.accuracy - b.accuracy;
    if (Math.abs(accuracyDiff) > 5) { // If accuracy difference is significant
      return accuracyDiff;
    }
    return b.timestamp - a.timestamp; // Otherwise prefer newer
  });
  
  return sorted[0];
}

/**
 * Enhanced getCurrentLocation with multiple accuracy improvements
 */
export function getCurrentLocation(options: GPSOptions = {}): Promise<GPSLocation> {
  const {
    enableHighAccuracy = true,
    timeout = 30000, // 30 seconds
    maximumAge = 0, // Don't use cached location
    minAccuracy = 10, // Require 10 meters or better accuracy
    maxAttempts = 5
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    let attempts = 0;
    let bestLocation: GPSLocation | null = null;

    const successCallback = (position: GeolocationPosition) => {
      const location: GPSLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 999,
        timestamp: position.timestamp,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined
      };

      // Update global state
      gpsState.currentLocation = location;
      gpsState.accuracyHistory.push(location);
      gpsState.lastUpdate = Date.now();
      gpsState.error = null;

      // Keep only recent history (last 10 readings)
      if (gpsState.accuracyHistory.length > 10) {
        gpsState.accuracyHistory = gpsState.accuracyHistory.slice(-10);
      }

      // Check if accuracy is good enough
      if (location.accuracy <= minAccuracy) {
        resolve(location);
        return;
      }

      // If not accurate enough, try again
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`GPS attempt ${attempts}: Accuracy ${location.accuracy}m, trying again...`);
        setTimeout(() => {
          navigator.geolocation.getCurrentPosition(successCallback, errorCallback, geoOptions);
        }, 1000);
      } else {
        // Use the best location we got
        bestLocation = getMostAccurateLocation(gpsState.accuracyHistory);
        if (bestLocation) {
          console.log(`Using best available accuracy: ${bestLocation.accuracy}m`);
          resolve(bestLocation);
        } else {
          reject(new Error('Unable to get accurate location after multiple attempts'));
        }
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = 'Failed to get location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable. Please check your GPS settings.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
      }

      gpsState.error = errorMessage;
      reject(new Error(errorMessage));
    };

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    // Start the location request
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, geoOptions);
  });
}

/**
 * Start continuous GPS monitoring for better accuracy
 */
export function startGPSMonitoring(options: GPSOptions = {}): void {
  if (gpsState.isWatching) {
    console.log('GPS monitoring already active');
    return;
  }

  if (!navigator.geolocation) {
    console.error('Geolocation not supported');
    return;
  }

  const {
    enableHighAccuracy = true,
    timeout = 30000,
    maximumAge = 5000 // 5 seconds cache
  } = options;

  const successCallback = (position: GeolocationPosition) => {
    const location: GPSLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy || 999,
      timestamp: position.timestamp,
      altitude: position.coords.altitude || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined
    };

    // Update state
    gpsState.currentLocation = location;
    gpsState.accuracyHistory.push(location);
    gpsState.lastUpdate = Date.now();
    gpsState.error = null;

    // Keep only recent history
    if (gpsState.accuracyHistory.length > 20) {
      gpsState.accuracyHistory = gpsState.accuracyHistory.slice(-20);
    }

    console.log(`GPS Update: ${location.accuracy}m accuracy`);
  };

  const errorCallback = (error: GeolocationPositionError) => {
    gpsState.error = `GPS Error: ${error.message}`;
    console.error('GPS monitoring error:', error);
  };

  const geoOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge
  };

  watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, geoOptions);
  gpsState.isWatching = true;
  console.log('GPS monitoring started');
}

/**
 * Stop continuous GPS monitoring
 */
export function stopGPSMonitoring(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  gpsState.isWatching = false;
  console.log('GPS monitoring stopped');
}

/**
 * Get current GPS state
 */
export function getGPSState(): GPSState {
  return { ...gpsState };
}

/**
 * Get the best available location (from monitoring or single request)
 */
export function getBestLocation(): GPSLocation | null {
  if (gpsState.currentLocation) {
    return gpsState.currentLocation;
  }
  
  return getMostAccurateLocation(gpsState.accuracyHistory);
}

/**
 * Check if location is within specified radius of target
 */
export function isLocationWithinRadius(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number,
  userAccuracy: number = 0
): boolean {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  
  // Account for GPS accuracy - if user's GPS accuracy is poor, be more lenient
  const effectiveRadius = radiusMeters + userAccuracy;
  
  console.log(`Distance: ${distance.toFixed(1)}m, Radius: ${radiusMeters}m, Accuracy: ${userAccuracy}m, Effective: ${effectiveRadius}m`);
  
  return distance <= effectiveRadius;
}

/**
 * Get location accuracy status
 */
export function getAccuracyStatus(accuracy: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
  color: string;
} {
  if (accuracy <= 5) {
    return {
      status: 'excellent',
      message: 'Excellent accuracy',
      color: 'text-green-600'
    };
  } else if (accuracy <= 15) {
    return {
      status: 'good',
      message: 'Good accuracy',
      color: 'text-blue-600'
    };
  } else if (accuracy <= 50) {
    return {
      status: 'fair',
      message: 'Fair accuracy',
      color: 'text-yellow-600'
    };
  } else {
    return {
      status: 'poor',
      message: 'Poor accuracy - move to open area',
      color: 'text-red-600'
    };
  }
}

/**
 * Request location permissions with user-friendly messaging
 */
export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }

    // Try to get location - this will trigger permission request
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve(false);
        } else {
          resolve(true); // Other errors don't necessarily mean permission denied
        }
      },
      { timeout: 5000, maximumAge: 0 }
    );
  });
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate time elapsed since a date
 */
export function getTimeElapsed(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'hard':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get difficulty badge color
 */
export function getDifficultyBadgeColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to slug
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
