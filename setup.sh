#!/bin/bash

# GeoApp Setup Script
echo "🗺️ Setting up GeoApp - Adventure Check-in Application"
echo "=================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

echo "✅ Wrangler CLI ready"

# Create D1 database
echo "📊 Creating D1 database..."
wrangler d1 create geoapp

echo ""
echo "⚠️  Please update wrangler.toml with your database ID from the output above"
echo "   Look for database_id = \"\" and paste the ID there"
echo ""
read -p "Press enter after updating wrangler.toml..."

# Create R2 bucket
echo "🪣 Creating R2 bucket for photo storage..."
wrangler r2 bucket create geoapp-photos

echo ""
echo "⚠️  Please update wrangler.toml with your bucket name if different"
echo ""

# Initialize database with schema
echo "🏗️  Initializing database with schema..."
wrangler d1 execute geoapp --file=./schema.sql

echo ""
echo "🎉 Setup complete!"
echo "📋 Next steps:"
echo "   1. Run 'npm install' to install dependencies"
echo "   2. Run 'npm run dev' for local development"
echo "   3. Run 'npm run deploy' to deploy to Cloudflare"
echo ""
echo "🚀 Your adventure check-in app is ready to go!"

