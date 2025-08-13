import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
  DB: D1Database;
  PHOTOS?: R2Bucket;
  SHOPIFY_STORE_DOMAIN: string;
  SHOPIFY_ACCESS_TOKEN: string;
}

interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface ShopifyCustomerResponse {
  customers: ShopifyCustomer[];
}

interface ShopifySingleCustomerResponse {
  customer: ShopifyCustomer;
}

interface User {
  id: number;
  email: string;
  name: string;
  points: number;
  shopify_customer_id: string;
  shopify_shop_domain: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  points_reward: number;
  description: string;
  created_at: string;
}

interface Business {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  description: string;
  created_at: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend requests
app.use("*", cors());

// Health check
app.get("/api/", (c) => c.json({ name: "GeoApp Adventure Check-in API", status: "healthy" }));

// Shopify customer authentication endpoints
app.post("/api/auth/shopify/customer", async (c) => {
  const { email, password } = await c.req.json();
  
  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }
  
  try {
    // First, try to find the customer in Shopify
    const customerResponse = await fetch(`https://${c.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/customers/search.json?query=email:${email}`, {
      headers: {
        "X-Shopify-Access-Token": c.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });
    
    if (!customerResponse.ok) {
      return c.json({ error: "Failed to authenticate with Shopify" }, 500);
    }
    
    const customerData = await customerResponse.json() as ShopifyCustomerResponse;
    const customer = customerData.customers[0];
    
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }
    
    // For now, we'll assume the customer exists (in a real app, you'd verify the password)
    // In production, you'd want to implement proper password verification
    
    // Check if user exists in our database
    const existingUserStmt = c.env.DB.prepare("SELECT * FROM users WHERE shopify_customer_id = ?");
    let user = await existingUserStmt.bind(customer.id.toString()).first();
    
    if (!user) {
      // Create new user in our database
      const createUserStmt = c.env.DB.prepare(`
        INSERT INTO users (email, name, shopify_customer_id, shopify_shop_domain, avatar_url)
        VALUES (?, ?, ?, ?, ?) RETURNING *
      `);
      
      user = await createUserStmt.bind(
        customer.email,
        `${customer.first_name} ${customer.last_name}`.trim(),
        customer.id.toString(),
        c.env.SHOPIFY_STORE_DOMAIN,
        customer.avatar_url || null
      ).first();
    }
    
    return c.json({ 
      user,
      message: "Authentication successful"
    });
    
  } catch (error) {
    console.error("Shopify customer auth error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});

// Test endpoint to debug Shopify API access
app.get("/api/test/shopify", async (c) => {
  try {
    // Test shop endpoint with different API versions
    const apiVersions = ['2023-10', '2024-01', '2024-04', '2024-07', '2024-10', '2025-01'];
    const results = {};
    
    for (const version of apiVersions) {
      const shopResponse = await fetch(`https://${c.env.SHOPIFY_STORE_DOMAIN}/admin/api/${version}/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": c.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      });
      
      const shopData = await shopResponse.text();
      results[`shop_${version}`] = {
        status: shopResponse.status,
        data: shopData
      };
      
      const customersResponse = await fetch(`https://${c.env.SHOPIFY_STORE_DOMAIN}/admin/api/${version}/customers.json`, {
        headers: {
          "X-Shopify-Access-Token": c.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      });
      
      const customersData = await customersResponse.text();
      results[`customers_${version}`] = {
        status: customersResponse.status,
        data: customersData
      };
    }
    
    // Also test with basic auth using the token as password
    const basicAuthResponse = await fetch(`https://${c.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/shop.json`, {
      headers: {
        "Authorization": `Basic ${btoa(`${c.env.SHOPIFY_ACCESS_TOKEN}:`)}`,
        "Content-Type": "application/json"
      }
    });
    
    const basicAuthData = await basicAuthResponse.text();
    
    return c.json({
      store_domain: c.env.SHOPIFY_STORE_DOMAIN,
      access_token_length: c.env.SHOPIFY_ACCESS_TOKEN.length,
      access_token_preview: c.env.SHOPIFY_ACCESS_TOKEN.substring(0, 8) + "...",
      api_test_results: results,
      basic_auth_test: {
        status: basicAuthResponse.status,
        data: basicAuthData
      }
    });
    
  } catch (error) {
    return c.json({ 
      error: error.message,
      store_domain: c.env.SHOPIFY_STORE_DOMAIN,
      access_token_length: c.env.SHOPIFY_ACCESS_TOKEN.length
    });
  }
});

// Simple test endpoint to show available customers
app.get("/api/test/customers", async (c) => {
  try {
    const customersResponse = await fetch(`https://${c.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/customers.json`, {
      headers: {
        "X-Shopify-Access-Token": c.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });
    
    if (!customersResponse.ok) {
      return c.json({ error: "Failed to fetch customers" }, customersResponse.status);
    }
    
    const customersData = await customersResponse.json() as ShopifyCustomerResponse;
    
    // Extract just the essential info for testing
    const testCustomers = customersData.customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      first_name: customer.first_name,
      last_name: customer.last_name
    }));
    
    return c.json({
      total_customers: testCustomers.length,
      customers: testCustomers,
      test_instructions: "Use one of these customer emails to test the authentication endpoint"
    });
    
  } catch (error) {
    return c.json({ 
      error: error.message,
      store_domain: c.env.SHOPIFY_STORE_DOMAIN
    });
  }
});

app.get("/api/auth/shopify/customer/:customerId", async (c) => {
  const customerId = c.req.param("customerId");
  
  try {
    // Get customer from Shopify
    const customerResponse = await fetch(`https://${c.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/customers/${customerId}.json`, {
      headers: {
        "X-Shopify-Access-Token": c.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });
    
    if (!customerResponse.ok) {
      return c.json({ error: "Customer not found" }, 404);
    }
    
    const customerData = await customerResponse.json() as ShopifySingleCustomerResponse;
    const customer = customerData.customer;
    
    // Get or create user in our database
    const userStmt = c.env.DB.prepare("SELECT * FROM users WHERE shopify_customer_id = ?");
    let user = await userStmt.bind(customerId).first();
    
    if (!user) {
      // Create new user
      const createUserStmt = c.env.DB.prepare(`
        INSERT INTO users (email, name, shopify_customer_id, shopify_shop_domain, avatar_url)
        VALUES (?, ?, ?, ?, ?) RETURNING *
      `);
      
      user = await createUserStmt.bind(
        customer.email,
        `${customer.first_name} ${customer.last_name}`.trim(),
        customer.id.toString(),
        c.env.SHOPIFY_STORE_DOMAIN,
        customer.avatar_url || null
      ).first();
    }
    
    return c.json(user);
    
  } catch (error) {
    console.error("Error fetching customer:", error);
    return c.json({ error: "Failed to fetch customer" }, 500);
  }
});

// Get user points for redemption
app.get("/api/users/:id/points", async (c) => {
  const userId = c.req.param("id");
  const stmt = c.env.DB.prepare("SELECT points FROM users WHERE id = ?");
  const user = await stmt.bind(userId).first() as User | null;
  
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  return c.json({ points: user.points });
});

// Redeem points (this would integrate with your Shopify store)
app.post("/api/users/:id/redeem-points", async (c) => {
  const userId = c.req.param("id");
  const { points, discount_code } = await c.req.json();
  
  if (!points || points <= 0) {
    return c.json({ error: "Invalid points amount" }, 400);
  }
  
  try {
    // Get current user points
    const userStmt = c.env.DB.prepare("SELECT points FROM users WHERE id = ?");
    const user = await userStmt.bind(userId).first();
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    if (user.points < points) {
      return c.json({ error: "Insufficient points" }, 400);
    }
    
    // Deduct points
    const updateStmt = c.env.DB.prepare("UPDATE users SET points = points - ? WHERE id = ?");
    await updateStmt.bind(points, userId).run();
    
    // Here you would integrate with Shopify to create a discount code
    // For now, we'll just return success
    return c.json({ 
      success: true, 
      points_redeemed: points,
      remaining_points: user.points - points,
      discount_code: discount_code || `ADVENTURE${Date.now()}`
    });
    
  } catch (error) {
    console.error("Error redeeming points:", error);
    return c.json({ error: "Failed to redeem points" }, 500);
  }
});

// Users endpoints
app.get("/api/users/:email", async (c) => {
  const email = c.req.param("email");
  const stmt = c.env.DB.prepare("SELECT * FROM users WHERE email = ?");
  const user = await stmt.bind(email).first();
  
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  return c.json(user);
});

app.post("/api/users", async (c) => {
  const { email, name } = await c.req.json();
  
  if (!email || !name) {
    return c.json({ error: "Email and name are required" }, 400);
  }
  
  try {
    const stmt = c.env.DB.prepare("INSERT INTO users (email, name) VALUES (?, ?) RETURNING *");
    const user = await stmt.bind(email, name).first();
    return c.json(user);
  } catch (error) {
    return c.json({ error: "User already exists" }, 409);
  }
});

app.get("/api/users/:id/checkins", async (c) => {
  const userId = c.req.param("id");
  const stmt = c.env.DB.prepare(`
    SELECT c.*, l.name as location_name, bp.name as business_name 
    FROM checkins c 
    LEFT JOIN locations l ON c.location_id = l.id 
    LEFT JOIN business_partners bp ON c.business_partner_id = bp.id 
    WHERE c.user_id = ? 
    ORDER BY c.created_at DESC
  `);
  const checkins = await stmt.bind(userId).all();
  return c.json(checkins.results);
});

// Locations endpoints
app.get("/api/locations", async (c) => {
  const stmt = c.env.DB.prepare("SELECT * FROM locations ORDER BY name");
  const locations = await stmt.all();
  return c.json(locations.results);
});

app.get("/api/locations/nearby", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lon = parseFloat(c.req.query("lon") || "0");
  const radius = parseFloat(c.req.query("radius") || "50000"); // 50km default
  
  if (!lat || !lon) {
    return c.json({ error: "Latitude and longitude are required" }, 400);
  }
  
  // Simplified query - return all locations for now to avoid SQLite issues
  const stmt = c.env.DB.prepare("SELECT * FROM locations ORDER BY name");
  const locations = await stmt.all();
  
  // Add mock distance data for UI
  const locationsWithDistance = locations.results.map((location: any) => ({
    ...location,
    distance_meters: Math.floor(Math.random() * 50000) + 1000 // Mock distance
  }));
  
  return c.json(locationsWithDistance);
});

// Business partners endpoints
app.get("/api/partners", async (c) => {
  const stmt = c.env.DB.prepare("SELECT * FROM business_partners ORDER BY name");
  const partners = await stmt.all();
  return c.json(partners.results);
});

app.get("/api/partners/nearby", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lon = parseFloat(c.req.query("lon") || "0");
  const radius = parseFloat(c.req.query("radius") || "50000");
  
  if (!lat || !lon) {
    return c.json({ error: "Latitude and longitude are required" }, 400);
  }
  
  // Simplified query - return all business partners for now
  const stmt = c.env.DB.prepare("SELECT * FROM business_partners ORDER BY name");
  const partners = await stmt.all();
  
  // Add mock distance data for UI
  const partnersWithDistance = partners.results.map((partner: any) => ({
    ...partner,
    distance_meters: Math.floor(Math.random() * 50000) + 1000 // Mock distance
  }));
  
  return c.json(partnersWithDistance);
});

// Check-ins endpoints
app.post("/api/checkins", async (c) => {
  const { user_id, location_id, latitude, longitude } = await c.req.json();
  
  if (!user_id || !latitude || !longitude) {
    return c.json({ error: "User ID, latitude, and longitude are required" }, 400);
  }
  
  let verified = false;
  let distance_meters = null;
  let points_earned = 10; // Default points
  
  if (location_id) {
    // Verify distance to location
    const locationStmt = c.env.DB.prepare("SELECT latitude, longitude, radius_meters, points_reward FROM locations WHERE id = ?");
    const location = await locationStmt.bind(location_id).first();
    
    if (location) {
      // Calculate distance using Haversine formula
      const R = 6371000; // Earth's radius in meters
      const dLat = (latitude - location.latitude) * Math.PI / 180;
      const dLon = (longitude - location.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(location.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const distanceCalc = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance_meters = R * distanceCalc;
      
      if (distance_meters <= location.radius_meters) {
        verified = true;
        points_earned = location.points_reward;
      }
    }
  }
  
  const checkinStmt = c.env.DB.prepare(`
    INSERT INTO checkins (user_id, location_id, latitude, longitude, distance_meters, points_earned, verified) 
    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
  `);
  const checkin = await checkinStmt.bind(user_id, location_id, latitude, longitude, distance_meters, points_earned, verified).first();
  
  if (verified) {
    // Update user points
    const updatePointsStmt = c.env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?");
    await updatePointsStmt.bind(points_earned, user_id).run();
  }
  
  return c.json(checkin);
});

app.post("/api/business-checkins", async (c) => {
  const { user_id, business_partner_id, latitude, longitude } = await c.req.json();
  
  if (!user_id || !business_partner_id || !latitude || !longitude) {
    return c.json({ error: "User ID, business partner ID, latitude, and longitude are required" }, 400);
  }
  
  // Verify distance to business
  const businessStmt = c.env.DB.prepare("SELECT latitude, longitude, radius_meters, points_reward FROM business_partners WHERE id = ?");
  const business = await businessStmt.bind(business_partner_id).first();
  
  if (!business) {
    return c.json({ error: "Business partner not found" }, 404);
  }
  
  // Calculate distance
  const R = 6371000;
  const dLat = (latitude - business.latitude) * Math.PI / 180;
  const dLon = (longitude - business.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(business.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const distanceCalc = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance_meters = R * distanceCalc;
  
  const verified = distance_meters <= business.radius_meters;
  const points_earned = verified ? business.points_reward : 0;
  
  const checkinStmt = c.env.DB.prepare(`
    INSERT INTO checkins (user_id, business_partner_id, latitude, longitude, distance_meters, points_earned, verified) 
    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
  `);
  const checkin = await checkinStmt.bind(user_id, business_partner_id, latitude, longitude, distance_meters, points_earned, verified).first();
  
  if (verified) {
    const updatePointsStmt = c.env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?");
    await updatePointsStmt.bind(points_earned, user_id).run();
  }
  
  return c.json(checkin);
});

// Photos endpoints
app.post("/api/photos/upload-url", async (c) => {
  const { filename, contentType } = await c.req.json();
  
  if (!filename) {
    return c.json({ error: "Filename is required" }, 400);
  }
  
  const key = `photos/${Date.now()}-${filename}`;
  const signedUrl = await c.env.PHOTOS.createSignedUrl(key, {
    method: "PUT",
    expiresIn: 3600,
    contentType: contentType || "image/jpeg"
  });
  
  return c.json({
    uploadUrl: signedUrl,
    key: key,
    url: `https://photos.${c.env.PHOTOS.endpoint}/${key}`
  });
});

app.post("/api/photos", async (c) => {
  const { user_id, checkin_id, filename, url } = await c.req.json();
  
  if (!user_id || !filename || !url) {
    return c.json({ error: "User ID, filename, and URL are required" }, 400);
  }
  
  const points_earned = 5; // Points for photo upload
  
  const photoStmt = c.env.DB.prepare(`
    INSERT INTO photos (user_id, checkin_id, filename, url, points_earned) 
    VALUES (?, ?, ?, ?, ?) RETURNING *
  `);
  const photo = await photoStmt.bind(user_id, checkin_id, filename, url, points_earned).first();
  
  // Update user points
  const updatePointsStmt = c.env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?");
  await updatePointsStmt.bind(points_earned, user_id).run();
  
  return c.json(photo);
});

// Quests endpoints
app.get("/api/quests", async (c) => {
  const stmt = c.env.DB.prepare("SELECT * FROM quests WHERE is_active = 1 ORDER BY name");
  const quests = await stmt.all();
  return c.json(quests.results);
});

app.get("/api/quests/:id", async (c) => {
  const questId = c.req.param("id");
  const stmt = c.env.DB.prepare("SELECT * FROM quests WHERE id = ?");
  const quest = await stmt.bind(questId).first();
  
  if (!quest) {
    return c.json({ error: "Quest not found" }, 404);
  }
  
  // Get quest steps
  const stepsStmt = c.env.DB.prepare(`
    SELECT qs.*, l.name as location_name, l.latitude, l.longitude, l.radius_meters
    FROM quest_steps qs
    LEFT JOIN locations l ON qs.target_location_id = l.id
    WHERE qs.quest_id = ?
    ORDER BY qs.step_number
  `);
  const steps = await stepsStmt.bind(questId).all();
  
  return c.json({
    ...quest,
    steps: steps.results
  });
});

app.post("/api/quests/:id/start", async (c) => {
  const questId = c.req.param("id");
  const { user_id } = await c.req.json();
  
  if (!user_id) {
    return c.json({ error: "User ID is required" }, 400);
  }
  
  // Check if user already has this quest active
  const existingStmt = c.env.DB.prepare("SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ? AND status = 'active'");
  const existing = await existingStmt.bind(user_id, questId).first();
  
  if (existing) {
    return c.json({ error: "Quest already in progress" }, 400);
  }
  
  // Start the quest
  const startStmt = c.env.DB.prepare("INSERT INTO user_quests (user_id, quest_id) VALUES (?, ?) RETURNING *");
  const userQuest = await startStmt.bind(user_id, questId).first();
  
  return c.json(userQuest);
});

app.post("/api/quests/:id/complete-step", async (c) => {
  const questId = c.req.param("id");
  const { user_id, step_number, latitude, longitude, photo_url } = await c.req.json();
  
  if (!user_id || !step_number || !latitude || !longitude) {
    return c.json({ error: "User ID, step number, latitude, and longitude are required" }, 400);
  }
  
  // Get the user quest
  const userQuestStmt = c.env.DB.prepare("SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ? AND status = 'active'");
  const userQuest = await userQuestStmt.bind(user_id, questId).first();
  
  if (!userQuest) {
    return c.json({ error: "No active quest found" }, 404);
  }
  
  // Get the quest step
  const stepStmt = c.env.DB.prepare("SELECT * FROM quest_steps WHERE quest_id = ? AND step_number = ?");
  const step = await stepStmt.bind(questId, step_number).first();
  
  if (!step) {
    return c.json({ error: "Quest step not found" }, 404);
  }
  
  // Verify location if this step has a target location
  let verified = false;
  let distance_meters = null;
  
  if (step.target_location_id) {
    const locationStmt = c.env.DB.prepare("SELECT latitude, longitude, radius_meters FROM locations WHERE id = ?");
    const location = await locationStmt.bind(step.target_location_id).first();
    
    if (location) {
      // Calculate distance using Haversine formula
      const R = 6371000; // Earth's radius in meters
      const dLat = (latitude - location.latitude) * Math.PI / 180;
      const dLon = (longitude - location.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(location.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const distanceCalc = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance_meters = R * distanceCalc;
      
      if (distance_meters <= location.radius_meters) {
        verified = true;
      }
    }
  } else {
    // For steps without specific locations, just require photo
    verified = true;
  }
  
  if (!verified) {
    return c.json({ 
      error: "You must be at the correct location to complete this step",
      distance_meters,
      required_radius: step.target_location_id ? 50 : null
    }, 400);
  }
  
  // Create check-in for this step
  const checkinStmt = c.env.DB.prepare(`
    INSERT INTO checkins (user_id, location_id, latitude, longitude, distance_meters, points_earned, verified) 
    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
  `);
  const checkin = await checkinStmt.bind(
    user_id, 
    step.target_location_id, 
    latitude, 
    longitude, 
    distance_meters, 
    step.points_reward, 
    verified
  ).first();
  
  // Mark quest step as completed
  const completeStepStmt = c.env.DB.prepare(`
    INSERT INTO user_quest_steps (user_quest_id, quest_step_id, status, completed_at, photo_url, checkin_id)
    VALUES (?, ?, 'completed', CURRENT_TIMESTAMP, ?, ?)
  `);
  await completeStepStmt.bind(userQuest.id, step.id, photo_url, checkin.id).run();
  
  // Update user points
  const updatePointsStmt = c.env.DB.prepare("UPDATE users SET points = points + ? WHERE id = ?");
  await updatePointsStmt.bind(step.points_reward, user_id).run();
  
  // Check if quest is complete
  const totalStepsStmt = c.env.DB.prepare("SELECT COUNT(*) as total FROM quest_steps WHERE quest_id = ?");
  const totalSteps = await totalStepsStmt.bind(questId).first();
  
  const completedStepsStmt = c.env.DB.prepare(`
    SELECT COUNT(*) as completed FROM user_quest_steps 
    WHERE user_quest_id = ? AND status = 'completed'
  `);
  const completedSteps = await completedStepsStmt.bind(userQuest.id).first();
  
  if (completedSteps.completed >= totalSteps.total) {
    // Quest completed!
    const questStmt = c.env.DB.prepare("SELECT points_reward FROM quests WHERE id = ?");
    const quest = await questStmt.bind(questId).first();
    
    const completeQuestStmt = c.env.DB.prepare(`
      UPDATE user_quests 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, points_earned = ?
      WHERE id = ?
    `);
    await completeQuestStmt.bind(quest.points_reward, userQuest.id).run();
    
    // Award quest completion points
    await updatePointsStmt.bind(quest.points_reward, user_id).run();
    
    return c.json({
      step_completed: true,
      quest_completed: true,
      points_earned: step.points_reward + quest.points_reward,
      message: "Congratulations! You've completed the Meredith Sculpture Walk!"
    });
  }
  
  return c.json({
    step_completed: true,
    quest_completed: false,
    points_earned: step.points_reward,
    progress: `${completedSteps.completed + 1}/${totalSteps.total}`
  });
});

app.get("/api/users/:id/quests", async (c) => {
  const userId = c.req.param("id");
  
  const stmt = c.env.DB.prepare(`
    SELECT uq.*, q.name, q.description, q.points_reward,
           (SELECT COUNT(*) FROM quest_steps WHERE quest_id = q.id) as total_steps,
           (SELECT COUNT(*) FROM user_quest_steps uqs 
            JOIN quest_steps qs ON uqs.quest_step_id = qs.id 
            WHERE uqs.user_quest_id = uq.id AND uqs.status = 'completed') as completed_steps
    FROM user_quests uq
    JOIN quests q ON uq.quest_id = q.id
    WHERE uq.user_id = ?
    ORDER BY uq.started_at DESC
  `);
  const userQuests = await stmt.bind(userId).all();
  
  return c.json(userQuests.results);
});

app.post("/api/users/:id/quests", async (c) => {
  const userId = c.req.param("id");
  const { quest_id } = await c.req.json();
  
  if (!quest_id) {
    return c.json({ error: "Quest ID is required" }, 400);
  }
  
  try {
    const stmt = c.env.DB.prepare("INSERT INTO user_quests (user_id, quest_id) VALUES (?, ?) RETURNING *");
    const userQuest = await stmt.bind(userId, quest_id).first();
    return c.json(userQuest);
  } catch (error) {
    return c.json({ error: "Quest already started or not found" }, 409);
  }
});

// Achievements endpoints
app.get("/api/users/:id/achievements", async (c) => {
  const userId = c.req.param("id");
  const stmt = c.env.DB.prepare("SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC");
  const achievements = await stmt.bind(userId).all();
  return c.json(achievements.results);
});

export default app;
