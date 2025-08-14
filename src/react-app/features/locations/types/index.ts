// Location-specific types

import { Location, Coordinates } from '../../../shared/types';

export interface LocationFilters {
  category?: string;
  isActive?: boolean;
  radius?: number;
  center?: Coordinates;
}

export interface LocationSearchParams {
  query?: string;
  filters?: LocationFilters;
  page?: number;
  limit?: number;
}

export interface CheckInData {
  locationId: string;
  coordinates: Coordinates;
  photoUrl?: string;
  notes?: string;
  timestamp: string;
}

export interface LocationWithDistance extends Location {
  distance?: number;
  isNearby?: boolean;
}

export interface CheckInHistory {
  id: string;
  locationId: string;
  userId: string;
  coordinates: Coordinates;
  photoUrl?: string;
  notes?: string;
  timestamp: string;
  pointsEarned: number;
}

export interface LocationStats {
  totalCheckIns: number;
  uniqueVisitors: number;
  averageRating?: number;
  lastCheckIn?: string;
  popularTimes?: {
    hour: number;
    count: number;
  }[];
}

export interface LocationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface LocationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
