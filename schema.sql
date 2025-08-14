-- Adventure Check-in Application Database Schema

-- Users table for account management and points tracking
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    shopify_customer_id TEXT UNIQUE,
    shopify_access_token TEXT,
    shopify_shop_domain TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Adventure locations with GPS coordinates
CREATE TABLE locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    category TEXT DEFAULT 'adventure', -- adventure, scenic, hiking, etc.
    points_reward INTEGER DEFAULT 10,
    radius_meters INTEGER DEFAULT 1000, -- check-in radius
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Business partners participating in the rewards system
CREATE TABLE business_partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    category TEXT DEFAULT 'partner', -- restaurant, shop, activity, etc.
    points_reward INTEGER DEFAULT 15,
    radius_meters INTEGER DEFAULT 100,
    social_media_handles TEXT, -- JSON object with platforms
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User location check-ins with verification
CREATE TABLE checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    location_id INTEGER,
    business_partner_id INTEGER,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    distance_meters REAL,
    points_earned INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (business_partner_id) REFERENCES business_partners(id)
);

-- Adventure photos linked to check-ins
CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    checkin_id INTEGER,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    points_earned INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (checkin_id) REFERENCES checkins(id)
);

-- Multi-step challenge definitions
CREATE TABLE quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    points_reward INTEGER DEFAULT 100,
    difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
    estimated_time INTEGER DEFAULT 120, -- in minutes
    category TEXT DEFAULT 'exploration',
    requirements TEXT,
    instructions TEXT,
    max_participants INTEGER DEFAULT 100,
    start_date DATE,
    end_date DATE,
    location_area TEXT,
    tags TEXT,
    media_urls TEXT, -- comma-separated list of media file URLs
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual tasks within quests
CREATE TABLE quest_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quest_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    step_type TEXT NOT NULL, -- photo, checkin, question, task
    target_location_id INTEGER,
    target_business_id INTEGER,
    points_reward INTEGER DEFAULT 15,
    question TEXT,
    answer TEXT,
    task_instructions TEXT,
    media_urls TEXT, -- comma-separated list of media file URLs
    FOREIGN KEY (quest_id) REFERENCES quests(id),
    FOREIGN KEY (target_location_id) REFERENCES locations(id),
    FOREIGN KEY (target_business_id) REFERENCES business_partners(id)
);

-- Active and completed user quests
CREATE TABLE user_quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quest_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- active, completed, abandoned
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    points_earned INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quest_id) REFERENCES quests(id)
);

-- User quest step progress
CREATE TABLE user_quest_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_quest_id INTEGER NOT NULL,
    quest_step_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed
    completed_at DATETIME,
    photo_url TEXT,
    checkin_id INTEGER,
    FOREIGN KEY (user_quest_id) REFERENCES user_quests(id),
    FOREIGN KEY (quest_step_id) REFERENCES quest_steps(id),
    FOREIGN KEY (checkin_id) REFERENCES checkins(id)
);

-- Achievement system for gamification
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points_reward INTEGER DEFAULT 0,
    criteria_type TEXT, -- checkins, photos, quests_completed, etc.
    criteria_value INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Sample data for testing and demonstration

INSERT INTO users (email, name, points) VALUES
('demo@example.com', 'Demo User', 150),
('adventurer@example.com', 'Adventure Seeker', 75);

INSERT INTO locations (name, description, latitude, longitude, category, points_reward) VALUES
('Sunset Peak Trail', 'Beautiful hiking trail with panoramic sunset views', 40.7589, -111.8883, 'hiking', 25),
('Hidden Waterfall', 'Secret waterfall accessible by short hike', 40.7505, -111.8473, 'scenic', 30),
('Adventure Rock Climbing', 'Popular rock climbing spot for all skill levels', 40.7419, -111.8097, 'climbing', 35);

-- Meredith Sculpture Walk Locations (Downtown Meredith, NH)
INSERT INTO locations (name, description, latitude, longitude, category, points_reward, radius_meters) VALUES
('Meredith Sculpture Walk - "The Fisherman"', 'Bronze sculpture of a fisherman by the lake', 43.6578, -71.5003, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "Dancing Bears"', 'Playful bear sculptures in the park', 43.6582, -71.5008, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "The Reader"', 'Peaceful reading sculpture near the library', 43.6575, -71.5012, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "Lake Guardian"', 'Majestic guardian overlooking Lake Winnipesaukee', 43.6585, -71.4998, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "Community Circle"', 'Interactive community sculpture in the square', 43.6579, -71.5005, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "The Musician"', 'Musical notes and instruments sculpture', 43.6581, -71.5010, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "Nature''s Harmony"', 'Organic forms representing nature', 43.6576, -71.5007, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "The Explorer"', 'Adventure-themed sculpture with compass', 43.6583, -71.5001, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "Heritage Bridge"', 'Historical bridge sculpture near the water', 43.6577, -71.5009, 'sculpture', 15, 50),
('Meredith Sculpture Walk - "The Dreamer"', 'Contemplative sculpture in the garden', 43.6580, -71.5004, 'sculpture', 15, 50);

INSERT INTO business_partners (name, description, latitude, longitude, category, points_reward) VALUES
('Mountain Gear Outfitters', 'Complete outdoor gear and equipment store', 40.7608, -111.8910, 'shop', 20),
('Trail''s End Cafe', 'Post-hike meals and refreshments', 40.7520, -111.8456, 'restaurant', 15),
('Adventure Sports Rental', 'Bike, kayak, and gear rentals', 40.7435, -111.8123, 'rental', 25);

-- Meredith Downtown Business Partners
INSERT INTO business_partners (name, description, latitude, longitude, category, points_reward, radius_meters) VALUES
('Meredith Bay Coffee', 'Local coffee shop with lake views', 43.6578, -71.5005, 'restaurant', 20, 100),
('Meredith Village Savings Bank', 'Historic bank building', 43.6580, -71.5008, 'business', 10, 100),
('Meredith Public Library', 'Community library and gathering space', 43.6575, -71.5010, 'community', 15, 100);

INSERT INTO quests (name, description, points_reward, difficulty, estimated_time, category, requirements, instructions, max_participants, location_area, tags, media_urls, is_active) VALUES
('Weekend Warrior', 'Complete 3 different adventure locations in one weekend', 150, 'medium', 120, 'exploration', 'Comfortable walking shoes, camera', 'Visit 3 different adventure locations over the weekend and check in at each one.', 100, 'Various Locations', 'weekend,adventure,exploration', '', true),
('Local Explorer', 'Visit 2 business partners and 1 scenic location', 100, 'easy', 90, 'exploration', 'None', 'Visit local businesses and a scenic location to support the community.', 100, 'Local Area', 'local,business,community', '', true),
('Photo Champion', 'Upload photos at 5 different locations', 200, 'medium', 180, 'photography', 'Camera or smartphone', 'Take creative photos at 5 different locations and upload them to earn points.', 100, 'Various Locations', 'photography,creative,exploration', '', true),
('Meredith Sculpture Walk', 'Explore the beautiful sculptures throughout downtown Meredith, NH. Visit and photograph at least 10 sculptures with GPS verification to ensure you actually visit each location.', 500, 'medium', 90, 'exploration', 'Camera or smartphone for photos, comfortable walking shoes', 'Start your journey in downtown Meredith and visit each sculpture location. Take photos of each sculpture to prove your visit. GPS verification ensures you actually visit each location.', 100, 'Downtown Meredith, NH', 'sculpture,art,culture,meredith,walking', 'adventure-media/meredith-sculpture-walk-preview.jpg', true);

INSERT INTO quest_steps (quest_id, step_number, description, step_type, target_location_id, points_reward, media_urls) VALUES
(1, 1, 'Check in at any hiking trail before 8 AM', 'checkin', 1, 50, ''),
(1, 2, 'Visit a scenic location', 'checkin', 2, 50, ''),
(1, 3, 'Upload a photo from your adventure', 'photo', NULL, 50, '');

INSERT INTO quest_steps (quest_id, step_number, description, step_type, target_business_id, points_reward, media_urls) VALUES
(2, 1, 'Visit Mountain Gear Outfitters', 'business_visit', 1, 30, ''),
(2, 2, 'Stop by Trail''s End Cafe', 'business_visit', 2, 35, ''),
(2, 3, 'Check in at Hidden Waterfall', 'checkin', NULL, 35, '');

-- Meredith Sculpture Walk Quest Steps
INSERT INTO quest_steps (quest_id, step_number, description, step_type, target_location_id, points_reward, media_urls) VALUES
(4, 1, 'Visit and photograph "The Fisherman" sculpture by the lake. This bronze sculpture captures the essence of Meredith''s fishing heritage.', 'photo', 4, 25, ''),
(4, 2, 'Find and photograph the playful "Dancing Bears" sculptures in the park. These whimsical sculptures bring joy to visitors.', 'photo', 5, 25, ''),
(4, 3, 'Locate and photograph "The Reader" sculpture near the library. This peaceful sculpture celebrates learning and community.', 'photo', 6, 25, ''),
(4, 4, 'Visit the majestic "Lake Guardian" overlooking Lake Winnipesaukee. This sculpture represents the spirit of the lake.', 'photo', 7, 25, ''),
(4, 5, 'Photograph the interactive "Community Circle" sculpture in the town square. This piece brings people together.', 'photo', 8, 25, ''),
(4, 6, 'Find and photograph "The Musician" sculpture. This piece celebrates the arts and culture in Meredith.', 'photo', 9, 25, ''),
(4, 7, 'Visit the organic "Nature''s Harmony" sculpture. This piece represents the natural beauty of the region.', 'photo', 10, 25, ''),
(4, 8, 'Locate and photograph "The Explorer" with compass. This sculpture embodies the adventurous spirit.', 'photo', 11, 25, ''),
(4, 9, 'Visit the historical "Heritage Bridge" sculpture near the water. This piece honors Meredith''s history.', 'photo', 12, 25, ''),
(4, 10, 'Find and photograph "The Dreamer" in the garden. This contemplative sculpture invites reflection.', 'photo', 13, 25, '');

INSERT INTO achievements (name, description, points_reward, criteria_type, criteria_value) VALUES
('First Steps', 'Complete your first check-in', 25, 'checkins', 1),
('Photo Enthusiast', 'Upload 5 photos', 50, 'photos', 5),
('Quest Master', 'Complete 3 quests', 100, 'quests_completed', 3),
('Meredith Explorer', 'Complete the Meredith Sculpture Walk', 200, 'quests_completed', 1);

