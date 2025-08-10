#!/bin/bash

# Direct deployment script voor Hetzner server
echo "🚀 Deploying to upsellbusinessagency.com..."

# Server details
SERVER="root@116.203.217.151"
LOCAL_DIR="/Users/shannonpieternella/Documents/Upsell business agency site/web"

echo "📤 Uploading files to server..."

# Create directory and upload files
ssh $SERVER "mkdir -p /var/www/html/web"

# Copy all web files to server
scp -r "$LOCAL_DIR"/* $SERVER:/var/www/html/web/

echo "✅ Files uploaded"

# Setup on server
ssh $SERVER << 'ENDSSH'
cd /var/www/html/web

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Copy env file if exists
if [ -f .env.production ]; then
    cp .env.production .env
fi

# Create PM2 config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'upsell-web',
    script: 'payment-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Stop old process if exists
pm2 delete upsell-web 2>/dev/null || true

# Start application
pm2 start ecosystem.config.js
pm2 save

echo "✅ Application started"

# Show status
pm2 status
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Now you need to:"
echo "1. SSH to server: ssh $SERVER"
echo "2. Check if app is running: pm2 status"
echo "3. Configure nginx (see instructions below)"
echo ""
echo "The app is running on port 3001"
echo "Files are in: /var/www/html/web/"