// src/App.tsx

import React, { useState, useEffect } from "react";
import { MapPin, Trophy, User, Star, Navigation2, ShoppingBag } from "lucide-react";
import { LocationMap } from "./components/LocationMap";
import { CheckInCard } from "./components/CheckInCard";
import { QuestCard } from "./components/QuestCard";
import { ShopifyAuth } from "./components/ShopifyAuth";

interface User {
  id: number;
  email: string;
  name: string;
  points: number;
  shopify_customer_id?: string;
  avatar_url?: string;
}

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

interface Quest {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  is_active: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessPartner | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'quests' | 'profile'>('explore');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth success redirect
    const urlParams = new URLSearchParams(window.location.search);
    const authUser = urlParams.get('user');
    
    if (authUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(authUser));
        setUser(userData);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          fetchNearbyLocations(coords.lat, coords.lng);
          fetchNearbyBusinesses(coords.lat, coords.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Salt Lake City coordinates
          const defaultCoords = { lat: 40.7589, lng: -111.8883 };
          setUserLocation(defaultCoords);
          fetchNearbyLocations(defaultCoords.lat, defaultCoords.lng);
          fetchNearbyBusinesses(defaultCoords.lat, defaultCoords.lng);
        }
      );
    }

    fetchQuests();
    setIsLoading(false);
  }, []);

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/locations/nearby?lat=${lat}&lon=${lng}&radius=50000`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchNearbyBusinesses = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/partners/nearby?lat=${lat}&lon=${lng}&radius=50000`);
      if (response.ok) {
        const data = await response.json();
        setBusinessPartners(data);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/quests');
      if (response.ok) {
        const data = await response.json();
        setQuests(data);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  const handleCheckIn = async (lat: number, lng: number, locationId?: number, businessId?: number) => {
    if (!user) {
      alert('Please log in to check in');
      return;
    }

    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          location_id: locationId,
          business_partner_id: businessId,
          latitude: lat,
          longitude: lng
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.verified) {
          setUser({ ...user, points: user.points + result.points_earned });
          return { verified: true, points: result.points_earned };
        }
      }
      return { verified: false };
    } catch (error) {
      console.error('Check-in error:', error);
      return { verified: false };
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;

    try {
      // Get upload URL
      const urlResponse = await fetch('/api/photos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });

      if (urlResponse.ok) {
        const { uploadUrl, url } = await urlResponse.json();
        
        // Upload file
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { 'Content-Type': file.type }
        });

        // Save photo record
        const photoResponse = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            filename: file.name,
            url: url
          })
        });

        if (photoResponse.ok) {
          const photo = await photoResponse.json();
          setUser({ ...user, points: user.points + photo.points_earned });
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const handleShopifyLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Navigation2 className="w-16 h-16 mx-auto text-green-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading GeoApp...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="adventure-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">GeoApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center text-white">
                  <Star className="w-5 h-5 mr-1 text-yellow-300" />
                  <span className="font-bold mr-4">{user.points}</span>
                </div>
              )}
              <ShopifyAuth 
                user={user} 
                onLogin={handleShopifyLogin} 
                onLogout={handleLogout} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'explore', label: 'Explore', icon: MapPin },
              { id: 'quests', label: 'Quests', icon: Trophy },
              { id: 'profile', label: 'Profile', icon: User },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explore' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover Adventures</h2>
              <LocationMap
                userLocation={userLocation}
                locations={locations}
                businessPartners={businessPartners}
                onLocationSelect={setSelectedLocation}
                onBusinessSelect={setSelectedBusiness}
              />
            </div>
            <div className="space-y-6">
              {selectedLocation && (
                <CheckInCard
                  location={selectedLocation}
                  userLocation={userLocation}
                  onCheckIn={handleCheckIn}
                  onPhotoUpload={handlePhotoUpload}
                />
              )}
              {selectedBusiness && (
                <CheckInCard
                  business={selectedBusiness}
                  userLocation={userLocation}
                  onCheckIn={handleCheckIn}
                  onPhotoUpload={handlePhotoUpload}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Adventure Quests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onStartQuest={() => {}}
                  isStarted={false}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
            {user ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4 mb-6">
                  {user.avatar_url && (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-2">
                      <Star className="w-5 h-5 text-yellow-500 mr-1" />
                      <span className="font-bold text-lg">{user.points} points</span>
                    </div>
                  </div>
                </div>
                {user.shopify_customer_id && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm">Connected to Shopify</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Shopify Store</h3>
                <p className="text-gray-600 mb-6">
                  Link your Shopify account to start earning points and tracking your adventures!
                </p>
                <ShopifyAuth 
                  user={user} 
                  onLogin={handleShopifyLogin} 
                  onLogout={handleLogout} 
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
