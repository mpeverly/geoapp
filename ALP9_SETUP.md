# GeoApp Setup for alp9.com

This guide will help you connect your GeoApp adventure check-in system to your alp9.com Shopify store for customer authentication and points redemption.

## Overview

Your customers will:

1. **Sign up/login** to your alp9.com store (normal Shopify customer accounts)
2. **Use the GeoApp** to complete adventures and earn points
3. **Redeem points** for discounts in your alp9.com store

## Step 1: Get Your Shopify Access Token

1. **Log into your Shopify Admin**

   - Go to [alp9.myshopify.com/admin](https://alp9.myshopify.com/admin)
   - Sign in with your store credentials

2. **Create a Private App**

   - Go to "Settings" → "Apps and sales channels"
   - Click "Develop apps" (or "Manage private apps" if you see it)
   - Click "Create an app"
   - Name it "GeoApp Adventure Points"
   - Click "Create app"

3. **Configure App Permissions**

   - In your app settings, go to "Admin API integration"
   - Add the following scopes:
     - `read_customers`
     - `write_customers`
     - `read_orders`
     - `write_discounts`
   - Save the configuration

4. **Get Your Access Token**
   - In "Admin API integration", click "Install app"
   - Copy the "Admin API access token"
   - **Keep this token secure!**

## Step 2: Configure Environment Variables

1. **Update wrangler.toml**

   ```toml
   [env.development]
   vars = {
     ENVIRONMENT = "development",
     SHOPIFY_STORE_DOMAIN = "alp9.myshopify.com",
     SHOPIFY_ACCESS_TOKEN = "your_access_token_here"
   }

   [env.production]
   vars = {
     ENVIRONMENT = "production",
     SHOPIFY_STORE_DOMAIN = "alp9.myshopify.com",
     SHOPIFY_ACCESS_TOKEN = "your_access_token_here"
   }
   ```

2. **Deploy Your App**
   ```bash
   npm run deploy
   ```

## Step 3: Set Up Your Database

1. **Create D1 Database** (if not already done)

   ```bash
   npx wrangler d1 create geoapp
   ```

2. **Update wrangler.toml with your database ID**

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "geoapp"
   database_id = "your_database_id_here"
   ```

3. **Initialize Database Schema**
   ```bash
   npx wrangler d1 execute geoapp --file=./schema.sql
   ```

## Step 4: Add to Your Shopify Store

### Option A: Add as a Page in Your Store

1. **Create a New Page**

   - In Shopify admin, go to "Online Store" → "Pages"
   - Click "Add page"
   - Title: "Adventure Check-in"
   - Content: Add an iframe or link to your GeoApp

2. **Add to Navigation**
   - Go to "Online Store" → "Navigation"
   - Add "Adventure Check-in" to your main menu

### Option B: Add as a Link in Customer Account

1. **Edit Customer Account Template**
   - Go to "Online Store" → "Themes"
   - Click "Actions" → "Edit code"
   - Find "templates/customers/account.liquid"
   - Add a link to your GeoApp

## Step 5: Test the Integration

1. **Create a Test Customer**

   - In Shopify admin, go to "Customers"
   - Click "Add customer"
   - Create a test account

2. **Test Login**

   - Go to your GeoApp
   - Click "Login" with your test customer credentials
   - Verify the customer data loads correctly

3. **Test Points System**
   - Complete some check-ins to earn points
   - Try redeeming points for a discount code

## Step 6: Customize for Your Brand

### Update Branding

1. **Change App Title**

   - Update "GeoApp" to "Alp9 Adventures" or similar
   - Update colors to match your brand

2. **Add Your Logo**
   - Replace the default icons with your brand assets
   - Update the header with your logo

### Create Branded Quests

1. **Product-Related Adventures**

   - Create quests that relate to your products
   - Example: "Visit 3 hiking trails" for outdoor gear customers

2. **Location-Based Promotions**
   - Partner with local businesses
   - Create quests for visiting partner locations

## Step 7: Points Redemption System

### Automatic Discount Codes

The current system generates discount codes. To integrate better:

1. **Create Shopify Discount Codes**

   - Set up automatic discount code creation
   - Configure discount rules (e.g., 10% off for 100 points)

2. **Points-to-Discount Conversion**
   - 100 points = $5 off
   - 250 points = $15 off
   - 500 points = $35 off

### Customer Communication

1. **Email Notifications**

   - Notify customers when they earn points
   - Send reminders about available rewards

2. **In-Store Promotions**
   - Display points balance in customer account
   - Show available rewards

## Step 8: Marketing Integration

### Social Media Campaigns

1. **Adventure Photo Sharing**

   - Encourage customers to share adventure photos
   - Award bonus points for social media engagement

2. **Referral Program**
   - Give points for referring friends
   - Create team challenges

### Email Marketing

1. **Adventure Newsletters**

   - Share new quests and locations
   - Highlight customer achievements

2. **Points Reminders**
   - Remind customers about expiring points
   - Promote new redemption options

## Troubleshooting

### Common Issues

1. **"Customer not found" error**

   - Verify the customer exists in your Shopify store
   - Check that the email matches exactly

2. **"Failed to authenticate" error**

   - Verify your access token is correct
   - Check that the app has the right permissions

3. **Points not updating**
   - Check the database connection
   - Verify the user ID is correct

### Debug Mode

Add logging to your worker for debugging:

```typescript
console.log("Customer auth attempt:", { email, customerId });
```

## Security Considerations

1. **Access Token Security**

   - Never commit your access token to version control
   - Use environment variables
   - Rotate tokens regularly

2. **Customer Data**

   - Only request necessary customer information
   - Follow GDPR compliance
   - Implement proper data retention

3. **Points System**
   - Validate all point transactions
   - Prevent point manipulation
   - Implement rate limiting

## Next Steps

1. **Launch Marketing Campaign**

   - Announce the adventure program to your customers
   - Create promotional materials

2. **Monitor Performance**

   - Track customer engagement
   - Monitor points redemption rates
   - Analyze popular quests

3. **Expand Features**
   - Add more quest types
   - Implement leaderboards
   - Create seasonal challenges

## Support

For technical issues:

- **Shopify API**: [Shopify API Documentation](https://shopify.dev/docs/api)
- **Cloudflare Workers**: [Workers Documentation](https://developers.cloudflare.com/workers/)
- **GeoApp**: Check the main README.md

For alp9.com specific questions, contact your development team.

---

Happy adventuring with alp9.com! 🗺️🏔️🛍️
