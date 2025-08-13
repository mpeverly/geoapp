import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation, Camera, Star, Target, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

interface LocationMapProps {
  userLocation?: { lat: number; lng: number };
  locations: Location[];
  businessPartners: BusinessPartner[];
  onLocationSelect?: (location: Location) => void;
  onBusinessSelect?: (business: BusinessPartner) => void;
}

function LocationRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function LocationMap({ 
  userLocation, 
  locations, 
  businessPartners, 
  onLocationSelect, 
  onBusinessSelect 
}: LocationMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7589, -111.8883]);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  const adventureIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#gradient)">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
      </svg>
    `),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  const businessIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#gradient)">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"/>
      </svg>
    `),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  const userIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#gradient)">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-2xl"
      >
        <LocationRecenter center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center p-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <p className="font-semibold text-blue-800">Your Location</p>
                <p className="text-xs text-gray-600">Adventure starts here!</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Adventure location markers */}
        {locations.map((location) => (
          <Marker
            key={`location-${location.id}`}
            position={[location.latitude, location.longitude]}
            icon={adventureIcon}
          >
            <Popup>
              <div className="p-3 min-w-56">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-sm">{location.name}</h3>
                    <p className="text-xs text-gray-600 capitalize">{location.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{location.description}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {location.points_reward} points
                    </span>
                    {location.distance_meters && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {(location.distance_meters / 1000).toFixed(1)} km
                      </span>
                    )}
                  </div>
                  
                  {location.difficulty && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(location.difficulty)}`}>
                        {location.difficulty.toUpperCase()}
                      </span>
                      {location.estimated_time && (
                        <span className="text-xs text-gray-500">
                          ~{Math.floor(location.estimated_time / 60)}m
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {onLocationSelect && (
                  <button
                    onClick={() => onLocationSelect(location)}
                    className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Check In Here
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Business partner markers */}
        {businessPartners.map((business) => (
          <Marker
            key={`business-${business.id}`}
            position={[business.latitude, business.longitude]}
            icon={businessIcon}
          >
            <Popup>
              <div className="p-3 min-w-56">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-800 text-sm">{business.name}</h3>
                    <p className="text-xs text-gray-600 capitalize">{business.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{business.description}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {business.points_reward} points
                    </span>
                    {business.distance_meters && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {(business.distance_meters / 1000).toFixed(1)} km
                      </span>
                    )}
                  </div>
                  
                  {business.special_offer && (
                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                      <Sparkles className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800">{business.special_offer}</span>
                    </div>
                  )}
                </div>
                
                {onBusinessSelect && (
                  <button
                    onClick={() => onBusinessSelect(business)}
                    className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Visit Business
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

