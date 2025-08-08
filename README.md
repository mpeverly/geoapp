# GeoApp - Adventure Check-in Application

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/)

A full-stack location-based adventure check-in platform that gamifies outdoor exploration with GPS verification, photo sharing, business partnerships, and quest systems. Built with React, Vite, Hono, and deployed on Cloudflare's edge network.

## Features

### 🗺️ Location-Based Check-ins

- **GPS Verification**: Real-time location verification within customizable radius
- **Adventure Locations**: Discover hiking trails, scenic spots, and outdoor destinations
- **Distance Calculation**: Accurate distance tracking from your current location
- **Interactive Maps**: Leaflet-powered maps with custom markers and popups

### 🏪 Business Partnership Program

- **Local Business Integration**: Partner businesses participate in the rewards system
- **Business Check-ins**: Location-verified visits to partner establishments
- **Cross-Business Rewards**: Enhanced point rewards for business partnerships

### 🛒 Shopify Integration

- **Customer Authentication**: Seamless login using Shopify customer accounts
- **Points Redemption**: Redeem adventure points for discounts in your Shopify store
- **Customer Sync**: Automatic synchronization between GeoApp and Shopify customers
- **Reward System**: Earn points in GeoApp, spend them in your Shopify store

### 📸 Photo Upload & Verification

- **Adventure Photos**: Upload photos of your visits for extra points
- **Cloud Storage**: Secure photo storage with Cloudflare R2
- **Point Rewards**: Earn points for both check-ins and photo uploads

### 🎯 Quest System

- **Multi-Step Challenges**: Complete quests across locations and businesses
- **Progress Tracking**: Monitor quest completion and step progress
- **Achievement System**: Track progress and unlock achievements

### 🎁 Rewards System

- **Point Accumulation**: Earn points through various activities
- **Real-time Updates**: Live point tracking and leaderboards
- **Achievement Badges**: Unlock achievements based on activities
- **Shopify Redemption**: Convert points to store discounts

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** for utility-first styling
- **Leaflet** for interactive maps
- **Lucide React** for modern icons

### Backend

- **Hono** ultralight framework
- **Cloudflare Workers** for edge computing
- **Cloudflare D1** for serverless SQLite database
- **Cloudflare R2** for object storage
- **Shopify Admin API** for customer authentication and management

### Development

- **TypeScript** for type safety
- **ESLint** for code quality
- **PostCSS** with Autoprefixer

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Cloudflare account (for deployment)
- Shopify store with Admin API access

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd geoapp
npm install
```

### 2. Configuration Setup

**Important**: This application contains sensitive API credentials. Follow the security setup:

1. **Copy configuration templates:**
   ```bash
   cp wrangler.toml.example wrangler.toml
   cp wrangler.json.example wrangler.json
   ```

2. **Update with your credentials** (see [SETUP.md](./SETUP.md) for detailed instructions):
   - Shopify store domain
   - Shopify Admin API access token
   - Cloudflare D1 database ID

3. **Set up Cloudflare services:**
   ```bash
   npx wrangler login
   npx wrangler d1 create geoapp
   npx wrangler d1 execute geoapp --file=./schema.sql
   ```

### 3. Shopify Setup

1. **Create a Private App in Shopify:**
   - Go to your Shopify admin → Apps → Private apps
   - Create a new private app with Admin API access
   - Set scopes: `read_customers`, `read_shop`
   - Copy the Admin API access token

2. **Update your configuration files** with the token

### 4. Development

Start the development server:

```bash
npm run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

### 5. Deploy to Cloudflare

```bash
npm run build && npm run deploy
```

## Security

**⚠️ Important Security Notes:**

- **Never commit** `wrangler.toml` or `wrangler.json` to version control
- These files contain sensitive API credentials
- Use the `.example` files as templates
- The `.gitignore` file is configured to exclude sensitive files

## Database Schema

The application uses Cloudflare D1 (SQLite) with the following tables:

- **users** - User accounts with points tracking and Shopify integration
- **locations** - Adventure locations with GPS coordinates
- **business_partners** - Local business information
- **checkins** - User location visits with verification
- **photos** - Adventure photos linked to check-ins
- **quests** - Multi-step challenge definitions
- **quest_steps** - Individual tasks within quests
- **user_quests** - Active and completed user quests
- **achievements** - Gamification progress tracking

## API Endpoints

### Shopify Integration

- `POST /api/auth/shopify/customer` - Authenticate Shopify customer
- `GET /api/auth/shopify/customer/:customerId` - Get customer data
- `GET /api/users/:id/points` - Get user points
- `POST /api/users/:id/redeem-points` - Redeem points for discounts

### Users & Authentication

- `GET /api/users/:email` - Get user by email
- `POST /api/users` - Create new user
- `GET /api/users/:id/checkins` - Get user check-ins

### Locations & Check-ins

- `GET /api/locations` - Get all adventure locations
- `GET /api/locations/nearby` - Get locations near coordinates
- `POST /api/checkins` - Create location check-in
- `POST /api/business-checkins` - Create business check-in

### Photos & Media

- `POST /api/photos/upload-url` - Get signed upload URL
- `POST /api/photos` - Save photo metadata

### Partnerships & Quests

- `GET /api/partners` - Get business partners
- `GET /api/quests` - Get available quests
- `GET /api/users/:id/quests` - Get user quest progress

### Testing

- `GET /api/test/shopify` - Test Shopify API connection
- `GET /api/test/customers` - List available customers

## Features Roadmap

### Completed ✅

- [x] GPS-based location verification
- [x] Interactive maps with Leaflet
- [x] Photo upload with R2 storage
- [x] Point-based reward system
- [x] Quest system framework
- [x] Business partnership integration
- [x] Shopify customer authentication
- [x] Points redemption system
- [x] Customer data synchronization

### Planned 🚧

- [ ] Social media integration
- [ ] Advanced achievement system
- [ ] Leaderboards and competitions
- [ ] Push notifications
- [ ] Offline support
- [ ] Mobile app (React Native)
- [ ] Shopify discount code generation
- [ ] Customer analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Deployment

Monitor your deployment:

```bash
npx wrangler tail
```

Check logs:

```bash
npx wrangler dev --local
```

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Hono Documentation](https://hono.dev/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin)

---

Built with ❤️ for adventure seekers and outdoor enthusiasts
