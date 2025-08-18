import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Mock data for local development
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
  }
];

const mockBusinessPartners = [
  {
    id: 1,
    name: "Meredith Bay Coffee",
    description: "Local coffee shop with lake views",
    latitude: 43.6578,
    longitude: -71.5005,
    category: "restaurant",
    points_reward: 20,
    radius_meters: 100
  },
  {
    id: 2,
    name: "Meredith Village Savings Bank",
    description: "Historic bank building",
    latitude: 43.6580,
    longitude: -71.5008,
    category: "business",
    points_reward: 10,
    radius_meters: 100
  },
  {
    id: 3,
    name: "Meredith Public Library",
    description: "Community library and gathering space",
    latitude: 43.6575,
    longitude: -71.5010,
    category: "community",
    points_reward: 15,
    radius_meters: 100
  }
];

const app = new Hono();

// Add CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Adventure Quest API' });
});

// Get all quests
app.get('/quests', (c) => {
  return c.json(mockQuests);
});

// Get all locations
app.get('/locations', (c) => {
  return c.json(mockLocations);
});

// Get nearby locations
app.get('/locations/nearby', (c) => {
  const lat = parseFloat(c.req.query('lat') || '0');
  const lon = parseFloat(c.req.query('lon') || '0');
  const radius = parseFloat(c.req.query('radius') || '50000'); // 50km default
  
  if (!lat || !lon) {
    return c.json({ error: "Latitude and longitude are required" }, 400);
  }
  
  const locationsWithDistance = mockLocations.map(location => ({
    ...location,
    distance_meters: Math.round(calculateDistance(lat, lon, location.latitude, location.longitude))
  }));
  
  return c.json(locationsWithDistance);
});

// Get all business partners
app.get('/partners', (c) => {
  return c.json(mockBusinessPartners);
});

// Get nearby business partners
app.get('/partners/nearby', (c) => {
  const lat = parseFloat(c.req.query('lat') || '0');
  const lon = parseFloat(c.req.query('lon') || '0');
  const radius = parseFloat(c.req.query('radius') || '50000'); // 50km default
  
  if (!lat || !lon) {
    return c.json({ error: "Latitude and longitude are required" }, 400);
  }
  
  const partnersWithDistance = mockBusinessPartners.map(partner => ({
    ...partner,
    distance_meters: Math.round(calculateDistance(lat, lon, partner.latitude, partner.longitude))
  }));
  
  return c.json(partnersWithDistance);
});

// Check-in endpoint
app.post('/checkins', async (c) => {
  const { user_id, location_id, latitude, longitude, accuracy } = await c.req.json();
  
  if (!user_id || !latitude || !longitude) {
    return c.json({ error: "User ID, latitude, and longitude are required" }, 400);
  }
  
  let verified = false;
  let distance_meters = null;
  let points_earned = 10; // Default points
  let user_accuracy = accuracy || 50; // Default accuracy if not provided
  
  if (location_id) {
    // Find the location
    const location = mockLocations.find(loc => loc.id === location_id);
    
    if (location) {
      // Debug logging
      console.log('GPS Debug Info:');
      console.log(`User coordinates: ${latitude}, ${longitude}`);
      console.log(`Target coordinates: ${location.latitude}, ${location.longitude}`);
      console.log(`User accuracy: ${user_accuracy}m`);
      
      // Calculate distance using Haversine formula
      distance_meters = calculateDistance(latitude, longitude, location.latitude, location.longitude);
      
      console.log(`Calculated distance: ${distance_meters}m`);
      console.log(`Location radius: ${location.radius_meters}m`);
      console.log(`Effective radius: ${location.radius_meters + user_accuracy}m`);
      
      // Account for GPS accuracy in verification
      const effectiveRadius = location.radius_meters + user_accuracy;
      
      if (distance_meters <= effectiveRadius) {
        verified = true;
        points_earned = location.points_reward;
        console.log('✅ Check-in verified!');
      } else {
        console.log('❌ Check-in failed - too far away');
      }
    }
  }
  
  // Return enhanced response with GPS details
  return c.json({
    id: Date.now(),
    user_id,
    location_id,
    latitude,
    longitude,
    distance_meters: Math.round(distance_meters * 10) / 10, // Round to 1 decimal
    user_accuracy: Math.round(user_accuracy * 10) / 10,
    points_earned,
    verified,
    created_at: new Date().toISOString(),
    gps_details: {
      user_lat: latitude,
      user_lon: longitude,
      target_lat: location?.latitude,
      target_lon: location?.longitude,
      radius_meters: location?.radius_meters,
      effective_radius: location ? location.radius_meters + user_accuracy : null
    }
  });
});

// Business check-in endpoint
app.post('/business-checkins', async (c) => {
  const { user_id, business_partner_id, latitude, longitude, accuracy } = await c.req.json();
  
  if (!user_id || !latitude || !longitude) {
    return c.json({ error: "User ID, latitude, and longitude are required" }, 400);
  }
  
  let verified = false;
  let distance_meters = null;
  let points_earned = 10; // Default points
  let user_accuracy = accuracy || 50; // Default accuracy if not provided
  
  if (business_partner_id) {
    // Find the business partner
    const partner = mockBusinessPartners.find(p => p.id === business_partner_id);
    
    if (partner) {
      // Calculate distance using Haversine formula
      distance_meters = calculateDistance(latitude, longitude, partner.latitude, partner.longitude);
      
      // Account for GPS accuracy in verification
      const effectiveRadius = partner.radius_meters + user_accuracy;
      
      if (distance_meters <= effectiveRadius) {
        verified = true;
        points_earned = partner.points_reward;
      }
    }
  }
  
  return c.json({
    id: Date.now(),
    user_id,
    business_partner_id,
    latitude,
    longitude,
    distance_meters: Math.round(distance_meters * 10) / 10,
    user_accuracy: Math.round(user_accuracy * 10) / 10,
    points_earned,
    verified,
    created_at: new Date().toISOString()
  });
});

// Photo upload endpoint
app.post('/photos', async (c) => {
  const { user_id, location_id, step_id, filename, url, metadata } = await c.req.json();
  
  // Mock photo upload response
  const photoId = Date.now();
  const photoUrl = url || `https://example.com/photos/${photoId}.jpg`;
  
  return c.json({
    id: photoId,
    user_id,
    location_id,
    step_id,
    filename,
    url: photoUrl,
    metadata,
    points_earned: 25, // Points for photo upload
    created_at: new Date().toISOString()
  });
});

// Quest step completion endpoint
app.post('/quest-steps/complete', async (c) => {
  const { user_id, quest_id, step_id, photo_id, location_id } = await c.req.json();
  
  // Mock step completion
  const stepCompletion = {
    id: Date.now(),
    user_id,
    quest_id,
    step_id,
    photo_id,
    location_id,
    completed_at: new Date().toISOString(),
    points_earned: 15, // Points for completing a step
    verified: true
  };
  
  return c.json(stepCompletion);
});

// Get user's quest progress
app.get('/quest-progress/:userId/:questId', (c) => {
  const userId = parseInt(c.req.param('userId'));
  const questId = parseInt(c.req.param('questId'));
  
  // Mock quest progress data for Meredith Sculpture Walk
  if (questId === 1) {
    const mockSteps = [
      {
        id: 1,
        step_number: 1,
        title: "The Fisherman",
        description: "Find and photograph the bronze fisherman sculpture by the lake",
        location_name: "Meredith Sculpture Walk - \"The Fisherman\"",
        location_id: 1,
        latitude: 43.6578,
        longitude: -71.5003,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 2,
        step_number: 2,
        title: "Dancing Bears",
        description: "Locate the playful bear sculptures in the park",
        location_name: "Meredith Sculpture Walk - \"Dancing Bears\"",
        location_id: 2,
        latitude: 43.6582,
        longitude: -71.5008,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 3,
        step_number: 3,
        title: "The Reader",
        description: "Find the peaceful reading sculpture near the library",
        location_name: "Meredith Sculpture Walk - \"The Reader\"",
        location_id: 3,
        latitude: 43.6575,
        longitude: -71.5012,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 4,
        step_number: 4,
        title: "Lake Guardian",
        description: "Discover the majestic guardian overlooking Lake Winnipesaukee",
        location_name: "Meredith Sculpture Walk - \"Lake Guardian\"",
        location_id: 4,
        latitude: 43.6585,
        longitude: -71.4998,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 5,
        step_number: 5,
        title: "Community Circle",
        description: "Visit the interactive community sculpture in the square",
        location_name: "Meredith Sculpture Walk - \"Community Circle\"",
        location_id: 5,
        latitude: 43.6579,
        longitude: -71.5005,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 6,
        step_number: 6,
        title: "The Musician",
        description: "Find the sculpture celebrating local music culture",
        location_name: "Meredith Sculpture Walk - \"The Musician\"",
        location_id: 6,
        latitude: 43.6581,
        longitude: -71.5010,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 7,
        step_number: 7,
        title: "Water Spirit",
        description: "Locate the elegant water-themed sculpture by the marina",
        location_name: "Meredith Sculpture Walk - \"Water Spirit\"",
        location_id: 7,
        latitude: 43.6576,
        longitude: -71.4995,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 8,
        step_number: 8,
        title: "The Storyteller",
        description: "Find the narrative sculpture celebrating local history",
        location_name: "Meredith Sculpture Walk - \"The Storyteller\"",
        location_id: 8,
        latitude: 43.6583,
        longitude: -71.5007,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 9,
        step_number: 9,
        title: "Nature's Harmony",
        description: "Discover the organic sculpture blending with the landscape",
        location_name: "Meredith Sculpture Walk - \"Nature's Harmony\"",
        location_id: 9,
        latitude: 43.6577,
        longitude: -71.5009,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      },
      {
        id: 10,
        step_number: 10,
        title: "The Welcoming",
        description: "Find the friendly sculpture greeting visitors to Meredith",
        location_name: "Meredith Sculpture Walk - \"The Welcoming\"",
        location_id: 10,
        latitude: 43.6580,
        longitude: -71.5000,
        is_completed: false,
        photo_url: null,
        completed_at: null,
        points_earned: null
      }
    ];
    
    return c.json({
      quest_id: questId,
      user_id: userId,
      steps: mockSteps,
      total_steps: mockSteps.length,
      completed_steps: 0,
      total_points: 500,
      is_completed: false
    });
  }
  
  return c.json({ error: 'Quest not found' }, 404);
});

// User endpoints
app.get('/users/:id', (c) => {
  const userId = c.req.param('id');
  
  // Mock user data
  const user = {
    id: parseInt(userId),
    email: 'demo@example.com',
    name: 'Demo User',
    points: 150,
    level: 2,
    experience: 50,
    achievements: 3,
    checkins: 15
  };
  
  return c.json(user);
});

export default app;
