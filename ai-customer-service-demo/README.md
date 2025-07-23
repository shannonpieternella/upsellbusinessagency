# AI Customer Service Demo Platform

A fully functional, multilingual AI-powered customer service demo platform showcasing intelligent chatbots, real-time analytics, and seamless agent handoffs.

## Features

### 🌐 Multilingual Support
- Automatic language detection (English/Dutch)
- Seamless language switching mid-conversation
- Context-aware responses in user's preferred language

### 🤖 AI-Powered Chat
- GPT-4 integration for intelligent responses
- Industry-specific knowledge base
- Context-aware conversation handling
- Fallback responses for reliability

### 📊 Three Role Views
1. **Customer View**: Interactive chat with AI assistant
2. **Agent Dashboard**: Live ticket management with AI suggestions
3. **Manager Analytics**: Real-time KPIs and performance metrics

### 🏭 8 Industry Demos
- Healthcare / Zorgverlening
- E-commerce / E-commerce
- Real Estate / Vastgoed
- Energy / Energie
- Automotive / Automotive
- Hospitality / Horeca
- Financial / Financieel
- Education / Onderwijs

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js, Socket.io
- **AI**: OpenAI GPT-4 API
- **Charts**: Chart.js
- **Deployment**: PM2, Nginx, Hetzner VPS

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-customer-service-demo.git
cd ai-customer-service-demo
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

## Deployment

### Hetzner VPS Deployment

1. SSH into your Hetzner VPS:
```bash
ssh root@your-server-ip
```

2. Download and run the deployment script:
```bash
wget https://raw.githubusercontent.com/yourusername/ai-customer-service-demo/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

3. Follow the prompts to:
   - Enter your domain name
   - Configure SSL certificate
   - Set up the OpenAI API key

### Manual Deployment

1. Install dependencies on server:
```bash
apt update && apt upgrade -y
apt install -y nodejs npm nginx certbot python3-certbot-nginx
npm install -g pm2
```

2. Clone and setup application:
```bash
cd /var/www
git clone https://github.com/yourusername/ai-customer-service-demo.git
cd ai-customer-service-demo
npm ci --production
```

3. Configure environment variables:
```bash
cp .env.example .env
nano .env  # Add your API keys
```

4. Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. Configure Nginx:
```bash
cp nginx.conf /etc/nginx/sites-available/ai-demo
ln -s /etc/nginx/sites-available/ai-demo /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## API Endpoints

### Chat API
```
POST /api/chat
Body: {
  message: string,
  industry: string,
  language: 'en' | 'nl',
  sessionId: string
}
```

### Industries API
```
GET /api/industries?lang=en
```

### Tickets API
```
GET /api/tickets/:industry?lang=en
```

### Analytics API
```
GET /api/analytics/:industry?lang=en
```

## Project Structure

```
ai-customer-service-demo/
├── server.js              # Main server file
├── package.json           # Dependencies
├── ecosystem.config.js    # PM2 configuration
├── nginx.conf            # Nginx configuration
├── deploy.sh             # Deployment script
├── public/               # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── views/                # HTML templates
│   ├── index.html       # Landing page
│   └── demo.html        # Demo interface
└── server/
    ├── config/          # Configuration files
    │   └── industries.js
    ├── services/        # Business logic
    │   ├── openai.js
    │   └── mockData.js
    └── routes/          # API routes
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SESSION_SECRET`: Secret for session management

## Monitoring

### View Logs
```bash
pm2 logs ai-customer-service-demo
```

### Monitor Performance
```bash
pm2 monit
```

### Check Status
```bash
pm2 status
```

## Updating

To update the application on the server:
```bash
update-ai-demo
```

Or manually:
```bash
cd /var/www/ai-customer-service-demo
git pull origin main
npm ci --production
pm2 reload ai-customer-service-demo
```

## Security Considerations

1. Always use HTTPS in production
2. Keep your OpenAI API key secure
3. Implement rate limiting (already configured)
4. Regular security updates
5. Monitor for suspicious activity

## License

MIT License - feel free to use this demo for your own projects!

## Support

For issues or questions, please open an issue on GitHub or contact support@upsellbusiness.nl