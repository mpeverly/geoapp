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
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual tasks within quests
CREATE TABLE quest_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quest_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    step_type TEXT NOT NULL, -- checkin, photo, social_share, business_visit
    target_location_id INTEGER,
    target_business_id INTEGER,
    points_reward INTEGER DEFAULT 10,
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quest_id) REFERENCES quests(id),
    UNIQUE(user_id, quest_id)
);

-- Tracking of completed quest steps
CREATE TABLE quest_step_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_quest_id INTEGER NOT NULL,
    quest_step_id INTEGER NOT NULL,
    checkin_id INTEGER,
    photo_id INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_quest_id) REFERENCES user_quests(id),
    FOREIGN KEY (quest_step_id) REFERENCES quest_steps(id),
    FOREIGN KEY (checkin_id) REFERENCES checkins(id),
    FOREIGN KEY (photo_id) REFERENCES photos(id),
    UNIQUE(user_quest_id, quest_step_id)
);

-- Gamification progress tracking
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points_earned INTEGER DEFAULT 0,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Connected social platform accounts
CREATE TABLE social_media_integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    platform TEXT NOT NULL, -- facebook, instagram, tiktok, snapchat
    username TEXT,
    account_id TEXT,
    access_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, platform)
);

-- Insert sample data
INSERT INTO locations (name, description, latitude, longitude, category, points_reward) VALUES
('Sunset Peak Trail', 'Beautiful hiking trail with panoramic sunset views', 40.7589, -111.8883, 'hiking', 25),
('Hidden Waterfall', 'Secret waterfall accessible by short hike', 40.7505, -111.8473, 'scenic', 30),
('Adventure Rock Climbing', 'Popular rock climbing spot for all skill levels', 40.7419, -111.8097, 'climbing', 35);

INSERT INTO business_partners (name, description, latitude, longitude, category, points_reward) VALUES
('Mountain Gear Outfitters', 'Complete outdoor gear and equipment store', 40.7608, -111.8910, 'shop', 20),
('Trail''s End Cafe', 'Post-hike meals and refreshments', 40.7520, -111.8456, 'restaurant', 15),
('Adventure Sports Rental', 'Bike, kayak, and gear rentals', 40.7435, -111.8123, 'rental', 25);

INSERT INTO quests (name, description, points_reward) VALUES
('Weekend Warrior', 'Complete 3 different adventure locations in one weekend', 150),
('Local Explorer', 'Visit 2 business partners and 1 scenic location', 100),
('Photo Champion', 'Upload photos at 5 different locations', 200);

INSERT INTO quest_steps (quest_id, step_number, title, description, step_type, target_location_id, points_reward) VALUES
(1, 1, 'Sunrise Hike', 'Check in at any hiking trail before 8 AM', 'checkin', 1, 50),
(1, 2, 'Scenic Stop', 'Visit a scenic location', 'checkin', 2, 50),
(1, 3, 'Adventure Photo', 'Upload a photo from your adventure', 'photo', NULL, 50);

INSERT INTO quest_steps (quest_id, step_number, title, description, step_type, target_business_id, points_reward) VALUES
(2, 1, 'Gear Up', 'Visit Mountain Gear Outfitters', 'business_visit', 1, 30),
(2, 2, 'Refuel', 'Stop by Trail''s End Cafe', 'business_visit', 2, 35),
(2, 3, 'Scenic Adventure', 'Check in at Hidden Waterfall', 'checkin', NULL, 35);

