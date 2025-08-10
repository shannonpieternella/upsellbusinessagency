# 🔗 LIVE URLs - Jouw Sales Funnel is LIVE!

## ✅ Werkende URLs (Geen "sales" in de naam!)

### Hoofdpagina's:
- **https://upsellbusinessagency.com/info** - Informatie pagina (sales funnel)
- **https://upsellbusinessagency.com/start** - Start pagina (sales funnel)
- **https://upsellbusinessagency.com/aanbieding** - Aanbieding pagina (sales funnel)
- **https://upsellbusinessagency.com/bedankt** - Bedankt pagina (na betaling)

### Voor QR Codes:
Gebruik deze URLs voor je QR codes:

**Basis:**
```
https://upsellbusinessagency.com/info
```

**Met UTM tracking:**
```
https://upsellbusinessagency.com/info?utm_source=qr&utm_medium=print&utm_campaign=flyer
```

**Andere opties:**
```
https://upsellbusinessagency.com/start?utm_source=qr
https://upsellbusinessagency.com/aanbieding?utm_source=qr
```

## 📱 QR Code Voorbeelden:

### Voor flyers:
```
https://upsellbusinessagency.com/info?utm_source=flyer&utm_medium=print&utm_campaign=januari2025
```

### Voor visitekaartjes:
```
https://upsellbusinessagency.com/start?utm_source=visitekaart&utm_medium=qr
```

### Voor social media:
```
https://upsellbusinessagency.com/aanbieding?utm_source=instagram&utm_medium=bio
```

## 🔧 Technische Details:

- **Server IP**: 116.203.217.151
- **Payment Server**: Running op port 3001 (PM2)
- **Main App**: Running op port 8080
- **API Endpoint**: https://upsellbusinessagency.com/api/health
- **Stripe Webhook**: https://upsellbusinessagency.com/webhook/stripe

## ✅ Status Check:

Test of alles werkt:
```bash
# Pagina check
curl -I https://upsellbusinessagency.com/info

# API check
curl https://upsellbusinessagency.com/api/health
```

## 📊 Monitoring:

SSH naar server en check status:
```bash
ssh root@116.203.217.151
pm2 status
pm2 logs upsell-web
```

## 🎯 Belangrijke Updates Nog Te Doen:

1. **Facebook Pixel ID** toevoegen in HTML files
2. **Google Analytics ID** toevoegen  
3. **WhatsApp nummer** updaten in success.html
4. **Stripe Webhook** configureren in Stripe Dashboard:
   - URL: `https://upsellbusinessagency.com/webhook/stripe`
   - Events: `checkout.session.completed`

## 💡 Tips:

- Gebruik `/info` voor zakelijke contacten (minder opvallend)
- Gebruik `/aanbieding` voor directe sales
- Gebruik `/start` voor nieuwe klanten

---

**LIVE EN WERKEND! 🚀**

Test het zelf: https://upsellbusinessagency.com/info