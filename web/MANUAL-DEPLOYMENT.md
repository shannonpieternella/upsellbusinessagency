# 📋 Manual Deployment to Hetzner Server

## Server Details
- **IP**: 116.203.217.151
- **Domain**: upsellbusinessagency.com
- **Sales Page URL**: https://upsellbusinessagency.com/web/sales.html

## Step 1: Connect to Server
```bash
ssh root@116.203.217.151
```

## Step 2: Create Directory Structure
```bash
mkdir -p /var/www/upsellbusinessagency.com/web
cd /var/www/upsellbusinessagency.com/web
```

## Step 3: Clone from GitHub
```bash
# If git is not installed
apt-get update && apt-get install git -y

# Clone the repository
git clone https://github.com/shannonpieternella/upsellbusinessagency.git temp
mv temp/web/* .
mv temp/web/.env.production .
rm -rf temp
```

## Step 4: Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

## Step 5: Install PM2 (Process Manager)
```bash
npm install -g pm2
```

## Step 6: Install Dependencies
```bash
cd /var/www/upsellbusinessagency.com/web
npm install --production
```

## Step 7: Setup Environment Variables
```bash
# Copy production env file
cp .env.production .env

# Edit if needed
nano .env
```

## Step 8: Create PM2 Ecosystem File
```bash
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
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
EOF
```

## Step 9: Create Logs Directory
```bash
mkdir -p logs
```

## Step 10: Start the Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

## Step 11: Configure Nginx

### Find your nginx config
```bash
# Usually in one of these locations
nano /etc/nginx/sites-available/upsellbusinessagency.com
# OR
nano /etc/nginx/sites-available/default
```

### Add these location blocks inside your server block:
```nginx
    # Sales funnel
    location /web/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Stripe webhooks
    location /web/webhook/stripe {
        proxy_pass http://localhost:3001/webhook/stripe;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        proxy_set_header Content-Type $content_type;
        proxy_set_header stripe-signature $http_stripe_signature;
        proxy_request_buffering off;
        proxy_buffering off;
        client_max_body_size 0;
    }
    
    # Shortcuts
    location = /sales {
        return 301 https://$host/web/sales.html;
    }
    
    location = /qr {
        return 301 https://$host/web/sales.html?utm_source=qr&utm_medium=offline;
    }
```

### Test and reload nginx:
```bash
nginx -t
systemctl reload nginx
```

## Step 12: Update Frontend Files for Production

### SSH to server and update URLs in sales.html:
```bash
cd /var/www/upsellbusinessagency.com/web
nano sales.html
```

Find and replace:
- `/api/` with `/web/api/`
- `localhost:3001` with `upsellbusinessagency.com/web`

### Do the same for success.html:
```bash
nano success.html
```

## Step 13: Test the Deployment

### Check PM2 status:
```bash
pm2 status
pm2 logs upsell-payment-server
```

### Test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

### Visit the sales page:
```
https://upsellbusinessagency.com/web/sales.html
```

## Step 14: Configure Stripe Webhook (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://upsellbusinessagency.com/web/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret
5. Update it in your server's `.env` file
6. Restart PM2: `pm2 restart upsell-payment-server`

## 📱 QR Code URLs

For your QR codes, use these URLs:

### Short URL (after nginx setup):
```
https://upsellbusinessagency.com/qr
```

### Full URL with tracking:
```
https://upsellbusinessagency.com/web/sales.html?utm_source=qr&utm_medium=print&utm_campaign=january2025
```

## 🔧 Maintenance Commands

### View logs:
```bash
pm2 logs upsell-payment-server
```

### Restart server:
```bash
pm2 restart upsell-payment-server
```

### Update from GitHub:
```bash
cd /var/www/upsellbusinessagency.com/web
git pull origin main
npm install --production
pm2 restart upsell-payment-server
```

### Monitor server:
```bash
pm2 monit
```

## ⚠️ Important Notes

1. **SSL Certificate**: Make sure HTTPS is working on your domain
2. **Firewall**: Ensure port 443 (HTTPS) is open
3. **MongoDB**: The connection string in .env must be accessible from server
4. **Stripe**: Use LIVE keys for production
5. **Emails**: Zoho Mail credentials must be correct

## 🚨 Troubleshooting

### If payment server won't start:
```bash
pm2 logs upsell-payment-server --lines 50
```

### If nginx returns 502:
```bash
# Check if Node.js server is running
pm2 status
curl http://localhost:3001/api/health
```

### If emails aren't sending:
```bash
# Check logs for email errors
pm2 logs upsell-payment-server | grep -i email
```

### If MongoDB won't connect:
```bash
# Test connection from server
npm install -g mongodb
mongo "mongodb+srv://tradingviewsentinel:QrkpjJvX0PBnX0j2@sentinel.6czw8.mongodb.net/test"
```

## ✅ Verification Checklist

- [ ] Sales page loads at https://upsellbusinessagency.com/web/sales.html
- [ ] Both payment buttons work
- [ ] Stripe checkout opens correctly
- [ ] Success page shows after payment
- [ ] Emails are sent after purchase
- [ ] Data is saved to MongoDB
- [ ] QR shortcut (/qr) redirects correctly
- [ ] PM2 keeps server running after reboot

---

**Need help?** Check PM2 logs first: `pm2 logs upsell-payment-server`