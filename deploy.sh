#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with:"
    echo "NEXT_PUBLIC_CONVEX_URL"
    echo "CONVEX_SELF_HOSTED_URL"
    echo "CONVEX_SELF_HOSTED_ADMIN_KEY"
    exit 1
fi

# 3. Build and restart containers
echo "🏗️  Building and starting containers with Podman..."
podman-compose up -d --build

# 4. Clean up unused images
echo "🧹 Cleaning up old images..."
podman image prune -f

echo "✅ Deployment complete! application running at https://klimat22.com"
