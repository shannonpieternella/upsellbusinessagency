#!/bin/bash

# AI Customer Service Demo - Deployment Script for Hetzner VPS
# This script deploys the application to a Hetzner VPS running Ubuntu 22.04

set -e

echo "🚀 Starting deployment of AI Customer Service Demo..."

# Variables
APP_DIR="/var/www/ai-customer-service-demo"
REPO_URL="git@github.com:yourusername/ai-customer-service-demo.git"
PM2_APP_NAME="ai-customer-service-demo"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required dependencies
print_status "Installing dependencies..."
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js 18.x
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    print_status "Node.js already installed: $(node -v)"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
else
    print_status "PM2 already installed"
fi

# Setup firewall
print_status "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create app directory
print_status "Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or pull latest code
if [ -d ".git" ]; then
    print_status "Pulling latest code..."
    git pull origin main
else
    print_status "Cloning repository..."
    git clone $REPO_URL .
fi

# Install npm dependencies
print_status "Installing npm dependencies..."
npm ci --production

# Create logs directory
mkdir -p logs

# Setup environment variables
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOL
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=production
SESSION_SECRET=$(openssl rand -base64 32)
EOL
    print_warning "Please update the .env file with your actual OpenAI API key!"
fi

# Setup Nginx
print_status "Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/ai-customer-service-demo
ln -sf /etc/nginx/sites-available/ai-customer-service-demo /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Setup SSL with Let's Encrypt
print_status "Setting up SSL certificate..."
read -p "Enter your domain name (e.g., ai-demo.upsellbusiness.nl): " DOMAIN
read -p "Enter your email for SSL notifications: " EMAIL

certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Start application with PM2
print_status "Starting application with PM2..."
pm2 stop $PM2_APP_NAME || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# Setup log rotation
print_status "Setting up log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Create systemd service for PM2
print_status "Creating systemd service..."
cat > /etc/systemd/system/pm2-root.service << EOL
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=root
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=/root/.pm2
PIDFile=/root/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable pm2-root
systemctl start pm2-root

# Create update script
print_status "Creating update script..."
cat > /usr/local/bin/update-ai-demo << 'EOL'
#!/bin/bash
cd /var/www/ai-customer-service-demo
git pull origin main
npm ci --production
pm2 reload ai-customer-service-demo
echo "Update completed successfully!"
EOL

chmod +x /usr/local/bin/update-ai-demo

# Final status
print_status "Deployment completed successfully! 🎉"
echo ""
echo "========================================="
echo "AI Customer Service Demo is now running!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update the .env file with your OpenAI API key"
echo "2. Run 'pm2 restart ai-customer-service-demo' after updating .env"
echo "3. Access your application at: https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs"
echo "- Monitor: pm2 monit"
echo "- Update app: update-ai-demo"
echo "- Restart app: pm2 restart ai-customer-service-demo"
echo ""
print_warning "Don't forget to update your DNS records to point to this server!"