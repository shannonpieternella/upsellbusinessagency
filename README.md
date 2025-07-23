# Upsell Business Agency Website

Professional website met multiple demo projecten

## 🚀 Quick Start

### 1. Eerste keer setup (alleen 1x nodig):
```bash
npm install
```

### 2. Start de server:
```bash
npm start
```

### 3. Open in browser:
- Complete website: http://localhost:8080
- Hoofdwebsite: http://localhost:8080
- AI Demo: http://localhost:8080/ai-customer-service-demo

## 📱 Hoe te gebruiken

1. Ga naar http://localhost:8080
2. Scroll naar "Projecten" sectie
3. Klik op "AI Customer Service Platform"
4. Kies een industrie en test de AI chat!

## 🔧 AI Demo Setup

### OpenAI API Key toevoegen:
1. Open `.env` in hoofdmap
2. Vervang `your_openai_api_key_here` met je echte API key

## 📁 Structuur

```
/
├── index.html                 # Hoofdwebsite
├── styles.css                 # Hoofdwebsite styling
├── script.js                  # Hoofdwebsite JavaScript
├── package.json              # Alle NPM dependencies
├── node_modules/             # Gedeelde modules voor alle demos
├── .env                      # Environment variables
├── ai-customer-service-demo/  # AI demo app
│   ├── server.js             # Node.js backend
│   ├── public/               # Frontend files
│   └── views/                # HTML templates
└── [toekomstige-demo-2]/     # Ruimte voor meer demos
```

## 🌐 Voor Hetzner Deployment

Upload de hele folder en run:
```bash
npm install
npm start
```

Gebruik PM2 voor production:
```bash
npm install -g pm2
pm2 start start.js --name upsell-site
```

## ✨ Features

- Mooie portfolio website
- Live AI demo met 8 industrieën
- Meertalige ondersteuning (NL/EN)
- Real-time chat met GPT-4
- Agent & Manager dashboards

Veel succes! 🎉