#!/bin/bash

# Deployment script for Hetzner server
# Server IP: 116.203.217.151
# Domain: upsellbusinessagency.com

echo "🚀 Starting deployment to Hetzner server..."

# Configuration
SERVER_IP="116.203.217.151"
SERVER_USER="root"  # Change if different
REMOTE_PATH="/var/www/upsellbusinessagency.com/web"
LOCAL_PATH="."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Preparing files for deployment...${NC}"

# Create a deployment package excluding node_modules
tar -czf deploy-package.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='deploy-package.tar.gz' \
  --exclude='*.log' \
  .

echo -e "${GREEN}✓ Package created${NC}"

echo -e "${YELLOW}📤 Uploading to server...${NC}"

# Upload the package to server
scp deploy-package.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

echo -e "${GREEN}✓ Upload complete${NC}"

echo -e "${YELLOW}🔧 Configuring on server...${NC}"

# SSH to server and extract files
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
  # Create directory if it doesn't exist
  mkdir -p /var/www/upsellbusinessagency.com/web
  
  # Extract files
  cd /var/www/upsellbusinessagency.com/web
  tar -xzf /tmp/deploy-package.tar.gz
  
  # Install dependencies
  npm install --production
  
  # Create PM2 ecosystem file if not exists
  if [ ! -f ecosystem.config.js ]; then
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'upsell-payment-server',
    script: 'payment-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF
  fi
  
  # Start or restart with PM2
  pm2 stop upsell-payment-server 2>/dev/null || true
  pm2 start ecosystem.config.js
  pm2 save
  
  # Clean up
  rm /tmp/deploy-package.tar.gz
  
  echo "✓ Server configuration complete"
ENDSSH

# Clean up local package
rm deploy-package.tar.gz

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📌 Next steps:"
echo "1. Configure nginx to proxy /web/* to localhost:3001"
echo "2. Access your sales page at: https://upsellbusinessagency.com/web/sales.html"
echo "3. Make sure .env file is on server with credentials"
echo ""
echo "To check server status, SSH to server and run:"
echo "  pm2 status"
echo "  pm2 logs upsell-payment-server"