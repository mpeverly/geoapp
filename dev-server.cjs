const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8788;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Mock data (same as in functions/api/[[route]].ts)
const mockQuests = [
  {
    id: 1,
    name: "Meredith Sculpture Walk",
    description: "Explore the beautiful sculptures throughout downtown Meredith, NH. Visit and photograph at least 10 sculptures with GPS verification to ensure you actually visit each location.",
    points_reward: 500,
    difficulty: "medium",
    estimated_time: 90,
    category: "exploration",
    requirements: "Camera or smartphone for photos, comfortable walking shoes",
    instructions: "Start your journey in downtown Meredith and visit each sculpture location. Take photos of each sculpture to prove your visit. GPS verification ensures you actually visit each location.",
    max_participants: 100,
    location_area: "Downtown Meredith, NH",
    tags: "sculpture,art,culture,meredith,walking",
    media_urls: "adventure-media/meredith-sculpture-walk-preview.jpg",
    is_active: true
  },
  {
    id: 2,
    name: "Weekend Warrior",
    description: "Complete 3 different adventure locations in one weekend",
    points_reward: 150,
    difficulty: "medium",
    estimated_time: 120,
    category: "exploration",
    requirements: "Comfortable walking shoes, camera",
    instructions: "Visit 3 different adventure locations over the weekend and check in at each one.",
    max_participants: 100,
    location_area: "Various Locations",
    tags: "weekend,adventure,exploration",
    media_urls: "",
    is_active: true
  },
  {
    id: 3,
    name: "Photo Champion",
    description: "Upload photos at 5 different locations",
    points_reward: 200,
    difficulty: "medium",
    estimated_time: 180,
    category: "photography",
    requirements: "Camera or smartphone",
    instructions: "Take creative photos at 5 different locations and upload them to earn points.",
    max_participants: 100,
    location_area: "Various Locations",
    tags: "photography,creative,exploration",
    media_urls: "",
    is_active: true
  }
];

const mockLocations = [
  {
    id: 1,
    name: "Meredith Sculpture Walk - \"The Fisherman\"",
    description: "Bronze sculpture of a fisherman by the lake",
    latitude: 43.6578,
    longitude: -71.5003,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 2,
    name: "Meredith Sculpture Walk - \"Dancing Bears\"",
    description: "Playful bear sculptures in the park",
    latitude: 43.6582,
    longitude: -71.5008,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 3,
    name: "Meredith Sculpture Walk - \"The Reader\"",
    description: "Peaceful reading sculpture near the library",
    latitude: 43.6575,
    longitude: -71.5012,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 4,
    name: "Meredith Sculpture Walk - \"Lake Guardian\"",
    description: "Majestic guardian overlooking Lake Winnipesaukee",
    latitude: 43.6585,
    longitude: -71.4998,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 5,
    name: "Meredith Sculpture Walk - \"Community Circle\"",
    description: "Interactive community sculpture in the square",
    latitude: 43.6579,
    longitude: -71.5005,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 6,
    name: "Meredith Sculpture Walk - \"The Musician\"",
    description: "Sculpture celebrating local music culture",
    latitude: 43.6581,
    longitude: -71.5010,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 7,
    name: "Meredith Sculpture Walk - \"Water Spirit\"",
    description: "Elegant water-themed sculpture by the marina",
    latitude: 43.6576,
    longitude: -71.4995,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 8,
    name: "Meredith Sculpture Walk - \"The Storyteller\"",
    description: "Narrative sculpture celebrating local history",
    latitude: 43.6583,
    longitude: -71.5007,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 9,
    name: "Meredith Sculpture Walk - \"Nature's Harmony\"",
    description: "Organic sculpture blending with the landscape",
    latitude: 43.6577,
    longitude: -71.5009,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  },
  {
    id: 10,
    name: "Meredith Sculpture Walk - \"The Welcoming\"",
    description: "Friendly sculpture greeting visitors to Meredith",
    latitude: 43.6580,
    longitude: -71.5000,
    category: "sculpture",
    points_reward: 15,
    radius_meters: 50
  }
];

const mockBusinessPartners = [
  {
    id: 1,
    name: "Meredith Coffee Co.",
    description: "Local coffee shop with great views of the lake",
    latitude: 43.6575,
    longitude: -71.5000,
    category: "food",
    points_reward: 10,
    special_offer: "Free pastry with any coffee purchase"
  },
  {
    id: 2,
    name: "Lake Winnipesaukee Outfitters",
    description: "Outdoor gear and equipment rental",
    latitude: 43.6580,
    longitude: -71.5005,
    category: "outdoor",
    points_reward: 20,
    special_offer: "10% off kayak rentals"
  }
];

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// API Routes
app.get('/api/quests', (req, res) => {
  res.json(mockQuests);
});

app.get('/api/locations', (req, res) => {
  res.json(mockLocations);
});

app.get('/api/locations/nearby', (req, res) => {
  const { lat, lng, radius = 50000 } = req.query;
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusMeters = parseFloat(radius);

  const nearbyLocations = mockLocations.filter(location => {
    const distance = calculateDistance(userLat, userLng, location.latitude, location.longitude);
    return distance <= radiusMeters;
  });

  res.json(nearbyLocations);
});

app.get('/api/partners', (req, res) => {
  res.json(mockBusinessPartners);
});

app.get('/api/partners/nearby', (req, res) => {
  const { lat, lng, radius = 50000 } = req.query;
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusMeters = parseFloat(radius);

  const nearbyPartners = mockBusinessPartners.filter(partner => {
    const distance = calculateDistance(userLat, userLng, partner.latitude, partner.longitude);
    return distance <= radiusMeters;
  });

  res.json(nearbyPartners);
});

app.post('/api/checkins', (req, res) => {
  const { user_id, location_id, business_partner_id, latitude, longitude, accuracy = 50 } = req.body;

  // Debug logging
  console.log('GPS Debug Info:');
  console.log(`User coordinates: ${latitude}, ${longitude}`);
  console.log(`User accuracy: ${accuracy}m`);

  let targetLocation = null;
  let pointsEarned = 0;

  if (location_id) {
    targetLocation = mockLocations.find(loc => loc.id === location_id);
  } else if (business_partner_id) {
    targetLocation = mockBusinessPartners.find(partner => partner.id === business_partner_id);
  }

  if (!targetLocation) {
    return res.status(404).json({ error: 'Location not found' });
  }

  console.log(`Target coordinates: ${targetLocation.latitude}, ${targetLocation.longitude}`);

  const distance = calculateDistance(latitude, longitude, targetLocation.latitude, targetLocation.longitude);
  const effectiveRadius = targetLocation.radius_meters + accuracy;
  const verified = distance <= effectiveRadius;

  console.log(`Calculated distance: ${distance}m`);
  console.log(`Location radius: ${targetLocation.radius_meters}m`);
  console.log(`Effective radius: ${effectiveRadius}m`);

  if (verified) {
    pointsEarned = targetLocation.points_reward;
    console.log('✅ Check-in verified!');
  } else {
    console.log('❌ Check-in failed - too far away');
  }

  res.json({
    verified,
    points_earned: pointsEarned,
    distance_meters: distance,
    user_accuracy: accuracy,
    gps_details: {
      user_lat: latitude,
      user_lng: longitude,
      target_lat: targetLocation.latitude,
      target_lng: targetLocation.longitude,
      effective_radius: effectiveRadius
    }
  });
});

app.post('/api/business-checkins', (req, res) => {
  // Same as checkins for now
  return app.post('/api/checkins')(req, res);
});

app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const mockUser = {
    id: userId,
    email: 'demo@example.com',
    name: 'Demo User',
    points: 150,
    level: 2,
    experience: 50,
    achievements: 3,
    checkins: 15
  };
  res.json(mockUser);
});

app.post('/api/photos', (req, res) => {
  // Mock photo upload response
  res.json({
    success: true,
    photo_id: Math.floor(Math.random() * 1000),
    url: 'https://example.com/photo.jpg'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend should be running on http://localhost:5173`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/*`);
});
