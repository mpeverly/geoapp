// src/App.tsx

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Trophy, 
  User, 
  Compass, 
  Mountain, 
  Camera,
  Award,
  Target,
  Zap,
  TrendingUp,
  Crown,
  Gem,
  Sparkles,
  Settings
} from "lucide-react";
import { LocationMap } from "./features/locations/components/LocationMap";
import { CheckInCard } from "./features/locations/components/CheckInCard";
import { QuestCard } from "./features/quests/components/QuestCard";
import { AdminPanel } from "./features/admin/components/AdminPanel";
import { QuestTracker } from "./features/quests/components/QuestTracker";
import { User as SharedUser, Location as SharedLocation, Quest as SharedQuest } from "./shared/types";

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessPartner | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'quests' | 'quest-tracker' | 'profile' | 'leaderboard' | 'admin'>('explore');
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLocations, setAdminLocations] = useState<Location[]>([]);

  useEffect(() => {
    // Check for auth success redirect
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const authenticated = urlParams.get('authenticated');
    const admin = urlParams.get('admin');
    
    if (userId && authenticated === 'true') {
      fetchUser(userId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Create a mock user for testing
      const mockUser = {
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        points: 150,
        level: 2,
        experience: 50,
        achievements: 3,
        checkins: 15
      };
      setUser(mockUser);
    }

    // Check if user is admin
    if (admin === 'true') {
      setIsAdmin(true);
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
          // Default to Meredith coordinates for the sculpture walk
          const defaultCoords = { lat: 43.6578, lng: -71.5003 };
          setUserLocation(defaultCoords);
          fetchNearbyLocations(defaultCoords.lat, defaultCoords.lng);
          fetchNearbyBusinesses(defaultCoords.lat, defaultCoords.lng);
        }
      );
    }

    fetchQuests();
    
    if (isAdmin) {
      fetchAllLocations();
    }
    
    setIsLoading(false);
    
    // Hide welcome screen after 3 seconds
    setTimeout(() => setShowWelcome(false), 3000);
  }, [isAdmin]);

  // Fetch user quests when user is available
  useEffect(() => {
    if (user) {
      fetchUserQuests(user.id);
    }
  }, [user]);

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        // Add mock data for enhanced UI
        setUser({
          ...userData,
          level: Math.floor(userData.points / 100) + 1,
          experience: userData.points % 100,
          achievements: Math.floor(userData.points / 50),
          checkins: Math.floor(userData.points / 10)
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchUserQuests = async (userId: number) => {
    try {
      // Get quest progress from localStorage
      const questProgress = JSON.parse(localStorage.getItem('questProgress') || '{}');
      const userQuestsData = [];
      
      // Get all quests and add progress info
      const questsResponse = await fetch('/api/quests');
      if (questsResponse.ok) {
        const allQuests = await questsResponse.json();
        
        for (const quest of allQuests) {
          const progress = questProgress[quest.id];
          if (progress && progress.userId === userId) {
            userQuestsData.push({
              ...quest,
              isStarted: true,
              steps_completed: progress.completedSteps.length,
              steps_required: progress.totalSteps,
              isCompleted: progress.isCompleted,
              progress: progress
            });
          }
        }
      }
      
      setUserQuests(userQuestsData);
    } catch (error) {
      console.error('Error fetching user quests:', error);
    }
  };

  const startQuest = async (questId: number) => {
    if (!user) return;
    
    try {
      // For now, use localStorage to track quest progress
      const questProgress = JSON.parse(localStorage.getItem('questProgress') || '{}');
      
      if (questProgress[questId]) {
        alert('Quest already in progress!');
        return;
      }
      
      // Get quest details
      const questResponse = await fetch(`/api/quests/${questId}`);
      if (questResponse.ok) {
        const quest = await questResponse.json();
        
        // Initialize quest progress
        questProgress[questId] = {
          questId,
          userId: user.id,
          startedAt: new Date().toISOString(),
          completedSteps: [],
          totalSteps: quest.steps?.length || 0,
          isCompleted: false
        };
        
        localStorage.setItem('questProgress', JSON.stringify(questProgress));
        
        // Update user quests
        fetchUserQuests(user.id);
        
        alert(`🎉 ${quest.name} started! You have ${quest.steps?.length || 0} steps to complete.`);
      } else {
        alert('Failed to get quest details');
      }
    } catch (error) {
      console.error('Error starting quest:', error);
      alert('Failed to start quest');
    }
  };

  const completeQuestStep = async (questId: number, stepNumber: number, _photoUrl?: string) => {
    if (!user || !userLocation) return;
    
    try {
      // Get quest progress from localStorage
      const questProgress = JSON.parse(localStorage.getItem('questProgress') || '{}');
      const progress = questProgress[questId];
      
      if (!progress) {
        alert('Quest not found or not started');
        return;
      }
      
      if (progress.completedSteps.includes(stepNumber)) {
        alert('Step already completed!');
        return;
      }
      
      // Get quest details to verify step
      const questResponse = await fetch(`/api/quests/${questId}`);
      if (questResponse.ok) {
        const quest = await questResponse.json();
        const step = quest.steps?.find((s: any) => s.step_number === stepNumber);
        
        if (!step) {
          alert('Step not found');
          return;
        }
        
        // For now, just mark as completed (we can add location verification later)
        progress.completedSteps.push(stepNumber);
        
        // Check if quest is completed
        if (progress.completedSteps.length >= progress.totalSteps) {
          progress.isCompleted = true;
          alert(`🎉 Congratulations! You've completed the ${quest.name} quest!`);
        } else {
          alert(`✅ Step ${stepNumber} completed! Progress: ${progress.completedSteps.length}/${progress.totalSteps}`);
        }
        
        // Save progress
        localStorage.setItem('questProgress', JSON.stringify(questProgress));
        
        // Update UI
        fetchUserQuests(user.id);
        fetchUser(user.id.toString());
      } else {
        alert('Failed to get quest details');
      }
    } catch (error) {
      console.error('Error completing quest step:', error);
      alert('Failed to complete step');
    }
  };

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/locations/nearby?lat=${lat}&lon=${lng}&radius=50000`);
      if (response.ok) {
        const data = await response.json();
        // Add mock data for enhanced UI
        const enhancedData = data.map((loc: Location) => ({
          ...loc,
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
          estimated_time: Math.floor(Math.random() * 120) + 30
        }));
        setLocations(enhancedData);
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
        // Add mock data for enhanced UI
        const enhancedData = data.map((business: BusinessPartner) => ({
          ...business,
          special_offer: ['20% off', 'Free coffee', 'BOGO deal', 'VIP access'][Math.floor(Math.random() * 4)]
        }));
        setBusinessPartners(enhancedData);
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
        // Use real data from database, only add mock data for missing fields
        const enhancedData = data.map((quest: Quest) => ({
          ...quest,
          difficulty: quest.difficulty || ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
          estimated_time: quest.estimated_time || Math.floor(Math.random() * 180) + 60,
          steps_required: quest.steps_required || Math.floor(Math.random() * 5) + 3,
          steps_completed: quest.steps_completed || Math.floor(Math.random() * 3),
          category: quest.category || ['exploration', 'social', 'photography', 'fitness'][Math.floor(Math.random() * 4)]
        }));
        setQuests(enhancedData);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  const fetchAllLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setAdminLocations(data);
      }
    } catch (error) {
      console.error('Error fetching all locations:', error);
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
          const newPoints = user.points + result.points_earned;
          const newLevel = Math.floor(newPoints / 100) + 1;
          const newExperience = newPoints % 100;
          setUser({ 
            ...user, 
            points: newPoints,
            level: newLevel,
            experience: newExperience,
            achievements: Math.floor(newPoints / 50),
            checkins: Math.floor(newPoints / 10)
          });
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
          const newPoints = user.points + photo.points_earned;
          setUser({ 
            ...user, 
            points: newPoints,
            level: Math.floor(newPoints / 100) + 1,
            experience: newPoints % 100
          });
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Compass className="w-20 h-20 mx-auto text-white animate-spin mb-6" />
            <Sparkles className="w-8 h-8 absolute -top-2 -right-2 text-green-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Adventure...</h2>
          <p className="text-green-200">Preparing your quest map</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <Mountain className="w-24 h-24 mx-auto text-white mb-4" />
            <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-green-400 animate-pulse" />
            <Sparkles className="w-4 h-4 absolute -bottom-2 -left-2 text-emerald-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Adventure Quest</h1>
          <p className="text-xl text-green-200 mb-6">Your journey begins now</p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-green-900 to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <Compass className="w-10 h-10 text-white mr-4" />
                <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-green-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Adventure Quest</h1>
                <p className="text-green-200 text-sm">Explore • Discover • Conquer</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                    <Gem className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-white">{user.points}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-white">Lv.{user.level}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'explore', label: 'Explore', icon: MapPin, color: 'text-green-600' },
              { id: 'quests', label: 'Quests', icon: Trophy, color: 'text-green-600' },
              { id: 'quest-tracker', label: 'Quest Tracker', icon: Target, color: 'text-blue-600' },
              { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp, color: 'text-orange-600' },
              { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-600' },
              ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Settings, color: 'text-purple-600' }] : []),
            ].map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === id
                    ? `border-green-500 ${color}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Discover Your Next Adventure</h2>
                <p className="text-lg opacity-90 mb-6">Explore nearby locations, complete quests, and earn rewards</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>{locations.length} locations nearby</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>{businessPartners.length} partner businesses</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-green-600" />
                  Adventure Map
                </h3>
                <LocationMap
                  userLocation={userLocation || undefined}
                  locations={locations}
                  businessPartners={businessPartners}
                  onLocationSelect={(location) => setSelectedLocation(location)}
                  onBusinessSelect={setSelectedBusiness}
                />
              </div>
              <div className="space-y-6">
                {selectedLocation && (
                  <CheckInCard
                    location={selectedLocation}
                    userLocation={userLocation || undefined}
                    onCheckIn={handleCheckIn}
                    onPhotoUpload={handlePhotoUpload}
                  />
                )}
                {selectedBusiness && (
                  <CheckInCard
                    business={selectedBusiness}
                    userLocation={userLocation || undefined}
                    onCheckIn={handleCheckIn}
                    onPhotoUpload={handlePhotoUpload}
                  />
                )}
                {!selectedLocation && !selectedBusiness && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <Compass className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Location</h3>
                    <p className="text-gray-600">Click on any marker on the map to see details and check in</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-8">
            {/* Quest Hero */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Epic Quests Await</h2>
                <p className="text-lg opacity-90 mb-6">Complete challenges, unlock achievements, and climb the ranks</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>{quests.length} active quests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Unlock rewards</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onStartQuest={() => startQuest(quest.id)}
                  isStarted={userQuests.some(uq => uq.quest_id === quest.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quest-tracker' && (
          <QuestTracker
            userQuests={userQuests}
            onCompleteStep={completeQuestStep}
            onUploadPhoto={async (questId, stepNumber, file) => {
              // Upload photo and complete step
              try {
                await handlePhotoUpload(file);
                completeQuestStep(questId, stepNumber);
              } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Failed to upload photo');
              }
            }}
          />
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            {/* Leaderboard Hero */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Adventure Leaderboard</h2>
                <p className="text-lg opacity-90">Compete with fellow adventurers and claim your spot at the top</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Top 3 */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">Adventure Master</h3>
                  <p className="text-gray-600">2,450 points</p>
                </div>

                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mx-auto flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">Explorer Pro</h3>
                  <p className="text-gray-600">1,890 points</p>
                </div>

                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">Quest Hunter</h3>
                  <p className="text-gray-600">1,234 points</p>
                </div>
              </div>

              {/* Your Position */}
              {user && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Your Position</h3>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-gray-600">Level {user.level} • {user.points} points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">#7</div>
                      <div className="text-sm text-gray-600">Top 10%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Profile Hero */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Adventurer Profile</h2>
                <p className="text-lg opacity-90">Track your progress and achievements</p>
              </div>
            </div>

            {user ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-6">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name}
                          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-green-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Gem className="w-6 h-6 text-yellow-600" />
                          <span className="font-semibold">Points</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600">{user.points}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Crown className="w-6 h-6 text-green-600" />
                          <span className="font-semibold">Level</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{user.level}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Award className="w-6 h-6 text-green-600" />
                          <span className="font-semibold">Achievements</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{user.achievements}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-6 h-6 text-blue-600" />
                          <span className="font-semibold">Check-ins</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{user.checkins}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress & Achievements */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Experience Bar */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Experience Progress</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Level {user.level}</span>
                        <span className="text-sm text-gray-600">{user.experience}/100 XP</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${user.experience}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {100 - (user.experience || 0)} XP needed for next level
                      </p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-xl">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Checked in at Mountain Peak</p>
                          <p className="text-sm text-gray-600">+25 points • 2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-xl">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Uploaded adventure photo</p>
                          <p className="text-sm text-gray-600">+10 points • 4 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-xl">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Completed "Mountain Explorer" quest</p>
                          <p className="text-sm text-gray-600">+100 points • 1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Compass className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Adventure Quest</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Connect your account to start tracking your adventures, earning points, and competing on the leaderboard.
                </p>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold">
                  Connect Account
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Panel */}
        {activeTab === 'admin' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <AdminPanel 
              locations={adminLocations} 
              onRefresh={fetchAllLocations}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
