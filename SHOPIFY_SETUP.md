# Shopify Integration Setup Guide

This guide will help you integrate your GeoApp with Shopify for user authentication and profile management.

## Prerequisites

- A Shopify Partner account (free)
- A Shopify store (development or production)
- Your GeoApp deployed on Cloudflare Workers

## Step 1: Create a Shopify App

1. **Log into Shopify Partners Dashboard**

   - Go to [partners.shopify.com](https://partners.shopify.com)
   - Sign in with your Shopify account

2. **Create a New App**

   - Click "Apps" in the left sidebar
   - Click "Create app"
   - Choose "Create app manually"
   - Enter app name: "GeoApp Adventure Check-in"
   - Enter app URL: Your app's domain (e.g., `https://your-app.your-subdomain.workers.dev`)

3. **Configure App Settings**
   - In your app dashboard, go to "App setup"
   - Under "Admin API integration", click "Configure"
   - Add the following scopes:
     - `read_customers`
     - `write_customers`
   - Save the configuration

## Step 2: Get Your App Credentials

1. **Copy API Credentials**

   - In your app dashboard, go to "App setup"
   - Copy your "API key" (Client ID)
   - Copy your "API secret key" (Client Secret)

2. **Set Redirect URL**
   - In "App setup" → "Admin API integration"
   - Set "Allowed redirection URL(s)" to:
     ```
     https://your-app.your-subdomain.workers.dev/api/auth/shopify/callback
     ```
   - Replace with your actual app domain

## Step 3: Configure Environment Variables

1. **Update wrangler.toml**

   ```toml
   [env.development]
   vars = {
     ENVIRONMENT = "development",
     SHOPIFY_CLIENT_ID = "your_shopify_client_id",
     SHOPIFY_CLIENT_SECRET = "your_shopify_client_secret"
   }

   [env.production]
   vars = {
     ENVIRONMENT = "production",
     SHOPIFY_CLIENT_ID = "your_shopify_client_id",
     SHOPIFY_CLIENT_SECRET = "your_shopify_client_secret"
   }
   ```

2. **Deploy with Environment Variables**
   ```bash
   npm run deploy
   ```

## Step 4: Update Database Schema

Run the updated schema to add Shopify fields:

```bash
npx wrangler d1 execute geoapp --file=./schema.sql
```

## Step 5: Test the Integration

1. **Visit Your App**

   - Go to your deployed app URL
   - Click on "Profile" tab
   - Click "Connect Shopify"

2. **Enter Your Store Domain**

   - Enter your Shopify store domain (e.g., `your-store.myshopify.com`)
   - Click "Connect Shopify"

3. **Authorize the App**

   - You'll be redirected to Shopify
   - Click "Install app" to authorize
   - You'll be redirected back to your app

4. **Verify Connection**
   - Check that your profile shows "Connected to Shopify"
   - Your customer information should be displayed

## Step 6: Customize for Your Store

### Add to Your Shopify Store

1. **Create a Custom Page**

   - In your Shopify admin, go to "Online Store" → "Pages"
   - Create a new page called "Adventure Check-in"
   - Add an iframe or link to your GeoApp

2. **Add to Navigation**

   - Go to "Online Store" → "Navigation"
   - Add the Adventure Check-in page to your main menu

3. **Customize the Experience**
   - Update the app branding to match your store
   - Add your store's logo and colors
   - Create custom quests related to your products

### Integration Ideas

1. **Product-Based Quests**

   - Create quests that require visiting locations related to your products
   - Award points for outdoor activities that complement your brand

2. **Loyalty Program Integration**

   - Convert adventure points to store credit
   - Offer discounts based on adventure achievements
   - Create exclusive products for high-achieving adventurers

3. **Social Media Integration**
   - Share adventure photos on social media
   - Tag your store in adventure posts
   - Create user-generated content campaigns

## Troubleshooting

### Common Issues

1. **"Invalid shop domain" error**

   - Ensure the shop domain format is correct: `store-name.myshopify.com`
   - Check that the store exists and is accessible

2. **"Authentication failed" error**

   - Verify your Shopify app credentials are correct
   - Check that the redirect URL matches exactly
   - Ensure the app is installed on your store

3. **"Failed to get customer data" error**
   - Verify the app has the correct scopes
   - Check that the access token is valid
   - Ensure the customer exists in your store

### Debug Mode

Enable debug logging by adding to your worker:

```typescript
console.log("Shopify OAuth Debug:", { shop, code, state });
```

## Security Considerations

1. **Environment Variables**

   - Never commit Shopify credentials to version control
   - Use different credentials for development and production
   - Rotate credentials regularly

2. **Data Privacy**

   - Only request necessary customer data
   - Implement proper data retention policies
   - Follow GDPR and other privacy regulations

3. **Access Control**
   - Validate all user inputs
   - Implement proper session management
   - Use HTTPS for all communications

## Next Steps

1. **Deploy to Production**

   - Set up production environment variables
   - Test with real customers
   - Monitor performance and errors

2. **Enhance Features**

   - Add more quest types
   - Implement leaderboards
   - Create mobile app version

3. **Scale Up**
   - Add more locations and partners
   - Implement advanced analytics
   - Create admin dashboard

## Support

For issues with:

- **Shopify API**: Check [Shopify API Documentation](https://shopify.dev/docs/api)
- **Cloudflare Workers**: Check [Workers Documentation](https://developers.cloudflare.com/workers/)
- **GeoApp**: Check the main README.md file

---

Happy adventuring! 🗺️🏔️
