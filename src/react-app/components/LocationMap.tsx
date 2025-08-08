import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation, Camera, Star } from 'lucide-react';
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const businessIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange">
        <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const userIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue">
        <circle cx="12" cy="12" r="8"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
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
              <div className="text-center">
                <Navigation className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <p className="font-semibold">Your Location</p>
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
              <div className="p-2 min-w-48">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <h3 className="font-bold text-green-800">{location.name}</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2">{location.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {location.points_reward} points
                  </span>
                  {location.distance_meters && (
                    <span className="text-xs text-gray-500">
                      {(location.distance_meters / 1000).toFixed(1)} km away
                    </span>
                  )}
                </div>
                {onLocationSelect && (
                  <button
                    onClick={() => onLocationSelect(location)}
                    className="w-full mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
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
              <div className="p-2 min-w-48">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-orange-600" />
                  <h3 className="font-bold text-orange-800">{business.name}</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2">{business.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {business.points_reward} points
                  </span>
                  {business.distance_meters && (
                    <span className="text-xs text-gray-500">
                      {(business.distance_meters / 1000).toFixed(1)} km away
                    </span>
                  )}
                </div>
                {onBusinessSelect && (
                  <button
                    onClick={() => onBusinessSelect(business)}
                    className="w-full mt-2 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                  >
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

