# 🚀 Sales Funnel & Payment System - Complete Setup

## ✅ What Has Been Built

### 1. **Professional Sales Landing Page** (`sales.html`)
- High-converting sales funnel with 2 product options:
  - **Mentorship Program**: €45 per lesson
  - **Done-For-You Service**: €999 one-time
- Features included:
  - ⏰ Countdown timer for urgency
  - ⭐ Customer testimonials
  - 💯 Money-back guarantee
  - ❓ FAQ section
  - 📱 Mobile responsive design
  - 🎯 UTM tracking for QR codes and campaigns
  - 📊 Facebook Pixel & Google Analytics integration

### 2. **Stripe Payment Integration**
- Live Stripe checkout (using your LIVE keys)
- Accepts: Cards, iDEAL, Bancontact
- Automatic email collection during checkout
- Webhook handling for payment confirmation

### 3. **Success/Thank You Page** (`success.html`)
- Order confirmation display
- Email capture form (if not collected during checkout)
- Marketing consent checkbox
- Automatic confirmation email sending
- Confetti celebration effect

### 4. **Email System (Zoho Mail)**
- Automated confirmation emails with next steps
- Admin notifications for new orders
- Professional HTML email templates
- Appointment planner mention in emails

### 5. **MongoDB Database Integration**
- Connected to your MongoDB Atlas cluster (`leadscoding` database)
- Stores all customer data:
  - Email addresses
  - Names
  - Products purchased
  - UTM tracking parameters
  - Marketing consent
  - Purchase history
- GDPR compliant with consent tracking

### 6. **UTM & Analytics Tracking**
- Captures UTM parameters from QR codes
- Tracks through entire funnel
- Sends data to:
  - Facebook Pixel
  - Google Analytics
  - MongoDB database
  - Stripe metadata

## 📱 QR Code Setup

When someone scans your QR code, direct them to:
```
https://yourdomain.com/web/sales.html?utm_source=qr&utm_medium=print&utm_campaign=flyer_jan2025
```

## 🚀 How to Start the System

1. **Install dependencies** (only needed once):
```bash
cd web
npm install
```

2. **Start the server**:
```bash
npm start
```

3. **Access the sales page**:
- Local: http://localhost:3001/sales.html
- Or just: http://localhost:3001/

## 📧 Email Flow

1. Customer makes purchase
2. System automatically:
   - Saves to MongoDB database
   - Sends confirmation email with next steps
   - Mentions appointment planner coming within 24 hours
   - Sends admin notification to you
3. If email not captured during checkout:
   - Success page shows email form
   - Customer provides email with consent
   - System sends all emails

## 🔧 Important Configuration

### Update These Before Going Live:

1. **Facebook Pixel ID** in `sales.html` and `success.html`:
   - Replace `YOUR_PIXEL_ID` with actual ID

2. **Google Analytics** in both pages:
   - Replace `GA_MEASUREMENT_ID` with actual ID

3. **WhatsApp Number** in `success.html` and email templates:
   - Update `31612345678` to your business number

4. **Domain URLs** when deploying:
   - Update localhost references to your domain

## 💳 Test Payment Flow

1. Visit the sales page
2. Click either product button
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check:
   - Success page loads
   - Email sent (check inbox)
   - Data saved in MongoDB

## 📊 Database Access

Your email list is stored in MongoDB:
- Database: `leadscoding`
- Collection: `email_subscribers`
- Connection: Uses your existing MongoDB Atlas cluster

Each subscriber record includes:
- Email & name
- Product purchased
- Marketing consent
- UTM parameters
- Purchase history
- GDPR consent tracking

## 🎯 Marketing Features

- **UTM Tracking**: All parameters captured and stored
- **Conversion Tracking**: Purchase events sent to FB & GA
- **Email List Building**: Automatic with consent management
- **GDPR Compliant**: Consent checkbox and tracking

## 📝 Next Steps for You

1. ✅ Update Facebook Pixel ID
2. ✅ Update Google Analytics ID
3. ✅ Update WhatsApp number
4. ✅ Deploy to your server
5. ✅ Configure domain and SSL
6. ✅ Test complete flow
7. ✅ Create appointment planner (Calendly)
8. ✅ Send planner link within 24 hours of purchase

## 🛡️ Security Notes

- Using LIVE Stripe keys (be careful!)
- MongoDB connection is secure
- Email passwords are in .env (never commit!)
- HTTPS required for production

## 📞 Support Locations

- **Server logs**: Check console when running
- **MongoDB data**: Atlas dashboard
- **Stripe payments**: Stripe dashboard
- **Email issues**: Check Zoho mail settings
- **Tracking**: Facebook Events Manager & GA dashboard

---

**System is ready to accept payments and build your email list! 🎉**