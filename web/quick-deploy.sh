#!/bin/bash

# Quick deployment script - Run this locally to deploy to Hetzner
# Usage: ./quick-deploy.sh

echo "🚀 Quick Deploy to upsellbusinessagency.com"
echo "==========================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please make sure .env.production exists with your credentials"
    exit 1
fi

# Server details
SERVER="root@116.203.217.151"
REMOTE_DIR="/var/www/upsellbusinessagency.com/web"

echo "📦 Uploading files to server..."

# Create remote directory
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Upload all necessary files
scp -r \
    package.json \
    package-lock.json \
    payment-server.js \
    email-service.js \
    database-service.js \
    sales.html \
    success.html \
    README.md \
    .env.production \
    $SERVER:$REMOTE_DIR/

echo "✅ Files uploaded"

echo "🔧 Setting up server..."

# Execute setup commands on server
ssh $SERVER << 'ENDSSH'
cd /var/www/upsellbusinessagency.com/web

# Rename production env file
mv .env.production .env

# Install Node.js if needed
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

# Create PM2 config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'upsell-payment',
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

# Create logs directory
mkdir -p logs

# Stop existing process if running
pm2 stop upsell-payment 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "✅ Server setup complete"
ENDSSH

echo ""
echo "📝 Next steps:"
echo "============="
echo "1. SSH to server: ssh $SERVER"
echo "2. Add nginx configuration (see nginx-config.conf)"
echo "3. Reload nginx: systemctl reload nginx"
echo ""
echo "🔗 Your sales page will be at:"
echo "   https://upsellbusinessagency.com/web/sales.html"
echo ""
echo "📱 QR Code URL:"
echo "   https://upsellbusinessagency.com/web/sales.html?utm_source=qr"
echo ""
echo "To check status: ssh $SERVER 'pm2 status'"
echo "To view logs: ssh $SERVER 'pm2 logs upsell-payment'"