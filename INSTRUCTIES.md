# Instructies voor Upsell Business Agency Website

## 🚀 Quick Start

### Stap 1: Open Terminal
Open een terminal in de project folder.

### Stap 2: Start beide servers
```bash
./start.sh
```

Dit start:
- De hoofdwebsite op http://localhost:8000
- De AI demo server op http://localhost:3000

### Stap 3: Open in browser
Ga naar http://localhost:8000

## 📁 Project Structuur

```
Upsell Business Agency Site/
├── index.html              # Hoofdwebsite
├── styles.css              # Styling hoofdsite
├── script.js               # JavaScript hoofdsite
├── ai-customer-service-demo/   # AI Demo applicatie
│   ├── server.js           # Node.js backend
│   ├── package.json        # Dependencies
│   ├── public/             # Frontend files
│   └── views/              # HTML templates
└── start.sh                # Start script
```

## 🔧 AI Demo Configuratie

### OpenAI API Key toevoegen:
1. Open `ai-customer-service-demo/.env`
2. Voeg je OpenAI API key toe:
   ```
   OPENAI_API_KEY=jouw_api_key_hier
   ```

## 🌐 Voor Hetzner Upload

### Wat je moet uploaden:
1. De hele folder zoals hij nu is
2. Zorg dat Node.js geïnstalleerd is op je Hetzner VPS
3. Run in de ai-customer-service-demo folder: `npm install`
4. Start met PM2: `pm2 start server.js`

### Nginx configuratie:
- Gebruik de `ai-customer-service-demo/nginx.conf` als voorbeeld
- Pas het domein aan naar jouw domein

## 💡 Tips

- De AI demo is volledig geïntegreerd in je hoofdsite
- Klik op "AI Customer Service Platform" in de portfolio sectie voor de demo
- De demo werkt met 8 verschillende industrieën
- Ondersteunt Nederlands en Engels automatisch

## ❓ Problemen?

Als iets niet werkt:
1. Check of beide servers draaien (zie terminal output)
2. Check of de .env file correct is ingevuld
3. Check console in browser voor errors

Succes! 🎉