# Cloudflare Setup Guide

## Wrangler Configuration

This project uses Cloudflare Workers for deployment. To set up your own deployment:

### 1. Copy the Template

Copy the template file to create your own wrangler configuration:

```bash
cp wrangler.toml.template wrangler.toml
```

### 2. Update Configuration

Edit `wrangler.toml` with your own values:

```toml
name = "your-app-name"
main = "dist/geoapp/index.js"
compatibility_date = "2024-03-19"
compatibility_flags = ["nodejs_compat"]

[env.development]
vars = { 
  ENVIRONMENT = "development",
  SHOPIFY_STORE_DOMAIN = "your-store.myshopify.com",
  SHOPIFY_ACCESS_TOKEN = "your_admin_api_access_token_here"
}

[env.production]
vars = { 
  ENVIRONMENT = "production",
  SHOPIFY_STORE_DOMAIN = "your-store.myshopify.com",
  SHOPIFY_ACCESS_TOKEN = "your_admin_api_access_token_here"
}

[[d1_databases]]
binding = "DB"
database_name = "your-database-name"
database_id = "your-database-id-here"

[[r2_buckets]]
binding = "PHOTOS"
bucket_name = "your-photos-bucket-name"
```

### 3. Required Values

- **name**: Your Cloudflare Workers app name
- **SHOPIFY_STORE_DOMAIN**: Your Shopify store domain
- **SHOPIFY_ACCESS_TOKEN**: Your Shopify admin API access token
- **database_name**: Your D1 database name
- **database_id**: Your D1 database ID (get from Cloudflare dashboard)
- **bucket_name**: Your R2 bucket name for photo storage

### 4. Deploy

```bash
npm run deploy
```

## Security Note

The `wrangler.toml` file contains sensitive information and is excluded from Git. Only the template file (`wrangler.toml.template`) is included in the repository.

## Database Setup

1. Create a D1 database in your Cloudflare dashboard
2. Apply the schema: `npx wrangler d1 execute your-db-name --remote --file=schema.sql`
3. Update the `database_id` in your `wrangler.toml`

## R2 Bucket Setup

1. Create an R2 bucket in your Cloudflare dashboard
2. Update the `bucket_name` in your `wrangler.toml`
3. Configure CORS if needed for photo uploads
