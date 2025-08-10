# 🚀 DEPLOYMENT READY - Sales Funnel op upsellbusinessagency.com

## ✅ Wat is er klaar:

1. **Complete sales funnel systeem** met:
   - Professionele landing page (€45 mentorship / €999 done-for-you)
   - Stripe payment integratie (LIVE keys)
   - Thank you page met email capture
   - Automatische emails via Zoho Mail
   - MongoDB database voor email lijst (leadscoding)
   - UTM tracking voor QR codes

2. **Pushed naar GitHub**: https://github.com/shannonpieternella/upsellbusinessagency.git

3. **Deployment files aangemaakt** voor Hetzner server (116.203.217.151)

## 🎯 DEPLOY OPTIES:

### Optie 1: SNELSTE MANIER (Automatisch)
```bash
cd web
./quick-deploy.sh
```
Dit doet alles automatisch!

### Optie 2: HANDMATIG (Stap voor stap)
Volg de instructies in: `web/MANUAL-DEPLOYMENT.md`

### Optie 3: SSH DIRECT
```bash
# 1. Login op server
ssh root@116.203.217.151

# 2. Clone van GitHub
cd /var/www/upsellbusinessagency.com
git clone https://github.com/shannonpieternella/upsellbusinessagency.git
mv upsellbusinessagency/web .
rm -rf upsellbusinessagency

# 3. Setup
cd web
cp .env.production .env
npm install --production
npm install -g pm2
pm2 start payment-server.js --name upsell-payment
```

## 📱 QR CODE URLs:

Na deployment gebruik deze URLs voor je QR codes:

### Korte URL:
```
https://upsellbusinessagency.com/sales
```

### Met tracking:
```
https://upsellbusinessagency.com/web/sales.html?utm_source=qr&utm_medium=print&utm_campaign=flyer
```

## ⚙️ NGINX CONFIGURATIE:

Voeg dit toe aan je nginx config op de server:
```nginx
location /web/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location = /sales {
    return 301 https://$host/web/sales.html;
}
```

Dan: `systemctl reload nginx`

## 📊 NA DEPLOYMENT CHECKLIST:

- [ ] Test payment flow met echte kaart
- [ ] Check of emails aankomen
- [ ] Verificeer MongoDB data opslag
- [ ] Update Facebook Pixel ID in HTML files
- [ ] Update Google Analytics ID in HTML files
- [ ] Update WhatsApp nummer in success.html
- [ ] Setup Stripe webhook: https://upsellbusinessagency.com/web/webhook/stripe

## 🔍 MONITORING:

### Check server status:
```bash
ssh root@116.203.217.151 'pm2 status'
```

### Bekijk logs:
```bash
ssh root@116.203.217.151 'pm2 logs upsell-payment'
```

### Test health:
```bash
curl https://upsellbusinessagency.com/web/api/health
```

## 💡 BELANGRIJK:

1. **Stripe Webhook**: Na deployment, ga naar Stripe Dashboard en voeg webhook toe:
   - URL: `https://upsellbusinessagency.com/web/webhook/stripe`
   - Events: checkout.session.completed

2. **SSL Certificaat**: Zorg dat HTTPS werkt op je domein

3. **MongoDB**: Database is al geconfigureerd (leadscoding)

4. **Emails**: Zoho Mail credentials staan in .env.production

## 🆘 HULP NODIG?

Als iets niet werkt:
1. Check PM2 logs: `pm2 logs upsell-payment`
2. Check nginx logs: `tail -f /var/log/nginx/error.log`
3. Test lokaal eerst: `npm start` in web folder

---

**Alles staat klaar! Run `./quick-deploy.sh` om te deployen 🚀**