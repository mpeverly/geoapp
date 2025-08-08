# GeoApp Setup Guide

## Prerequisites

- Node.js 20 or higher
- Cloudflare account
- Shopify store with Admin API access

## Initial Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd geoapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Cloudflare credentials**
   ```bash
   npx wrangler login
   ```

## Configuration

### 1. Create Wrangler Configuration Files

Copy the example files and update them with your credentials:

```bash
cp wrangler.toml.example wrangler.toml
cp wrangler.json.example wrangler.json
```

### 2. Update Configuration Files

**Edit `wrangler.toml`:**
- Replace `your-store.myshopify.com` with your Shopify store domain
- Replace `your_admin_api_access_token_here` with your Shopify Admin API access token
- Replace `your_database_id_here` with your D1 database ID

**Edit `wrangler.json`:**
- Replace `your-store.myshopify.com` with your Shopify store domain
- Replace `your_admin_api_access_token_here` with your Shopify Admin API access token
- Replace `your_database_id_here` with your D1 database ID

### 3. Shopify Setup

1. **Create a Private App in Shopify:**
   - Go to your Shopify admin → Apps → Private apps
   - Click "Create a new private app"
   - Give it a name (e.g., "GeoApp Integration")
   - Set Admin API access scopes:
     - `read_customers`
     - `read_shop`
   - Save and copy the Admin API access token

2. **Update your configuration files** with the Admin API access token

### 4. Cloudflare Setup

1. **Create D1 Database:**
   ```bash
   npx wrangler d1 create geoapp
   ```
   Copy the database ID and update your configuration files.

2. **Initialize Database Schema:**
   ```bash
   npx wrangler d1 execute geoapp --file=./schema.sql
   ```

3. **Deploy the Application:**
   ```bash
   npx wrangler deploy
   ```

## Environment Variables

The following environment variables are configured in your wrangler files:

- `SHOPIFY_STORE_DOMAIN`: Your Shopify store domain (e.g., "alp9.com")
- `SHOPIFY_ACCESS_TOKEN`: Your Shopify Admin API access token
- `ENVIRONMENT`: Set to "development" or "production"

## Security Notes

- **Never commit** `wrangler.toml` or `wrangler.json` to version control
- These files contain sensitive API credentials
- Use the `.example` files as templates
- Consider using Cloudflare's secret management for production

## Testing the Integration

1. **Test Shopify API Connection:**
   ```bash
   curl https://your-worker.workers.dev/api/test/shopify
   ```

2. **Test Customer Authentication:**
   ```bash
   curl -X POST https://your-worker.workers.dev/api/auth/shopify/customer \
     -H "Content-Type: application/json" \
     -d '{"email": "customer@example.com", "password": "test123"}'
   ```

## Development

1. **Start local development:**
   ```bash
   npm run dev
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy updates:**
   ```bash
   npx wrangler deploy
   ```

## Troubleshooting

- **API Connection Issues**: Verify your Shopify Admin API access token and store domain
- **Database Issues**: Ensure your D1 database is created and schema is initialized
- **Deployment Issues**: Check that your Cloudflare account is properly configured
