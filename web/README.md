# Upsell Business Agency - Sales Funnel & Payment System

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Start the Payment Server
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The server will start on port 3001 (or the port specified in PAYMENT_PORT env variable).

### 3. Access the Sales Page
Open your browser and navigate to:
- Local: `http://localhost:3001/sales.html`
- Or just: `http://localhost:3001/`

## 📱 QR Code Integration

When users scan your QR code, redirect them to:
```
https://yourdomain.com/web/sales.html
```

### With UTM Tracking
Add UTM parameters to track campaign performance:
```
https://yourdomain.com/web/sales.html?utm_source=qr&utm_medium=print&utm_campaign=flyer_jan2025
```

## 📊 Analytics Setup

### Facebook Pixel
1. Replace `YOUR_PIXEL_ID` in both `sales.html` and `success.html` with your actual Facebook Pixel ID
2. The pixel will automatically track:
   - Page views
   - Content views
   - Initiate checkout events
   - Purchases with value
   - UTM parameters

### Google Analytics
1. Replace `GA_MEASUREMENT_ID` in both pages with your Google Analytics ID
2. Automatically tracks:
   - Page views
   - Checkout events
   - Purchase conversions
   - UTM campaign data

## 💳 Payment Options

### Two Products Available:

1. **Mentorship Program** - €45 per lesson
   - 1-on-1 video coaching
   - Personal action plan
   - 24/7 WhatsApp support
   - Lifetime updates

2. **Done-For-You Service** - €999 one-time
   - Complete business setup
   - Professional website & funnel
   - Email marketing system
   - 3 months aftercare

## 🔧 Configuration

### Environment Variables
The system uses the following from your `.env` file:
- `STRIPE_SECRET_KEY` - Your Stripe secret key (currently using LIVE key)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - For handling Stripe webhooks

### Stripe Configuration
Currently configured to use LIVE Stripe keys. The system accepts:
- Credit/Debit cards
- iDEAL (Dutch payment method)
- Bancontact (Belgian payment method)

## 🎯 UTM Tracking

The system automatically captures and stores UTM parameters:
- `utm_source` - Where the traffic came from (e.g., 'qr', 'facebook', 'email')
- `utm_medium` - Marketing medium (e.g., 'print', 'social', 'cpc')
- `utm_campaign` - Campaign name (e.g., 'summer_sale', 'launch')
- `utm_term` - Paid search keywords
- `utm_content` - Differentiates similar content/links

These are:
1. Stored in browser session
2. Sent to Facebook Pixel
3. Sent to Google Analytics
4. Included in Stripe payment metadata

## 📈 Conversion Features

### Landing Page Includes:
- ⏰ Countdown timer (creates urgency)
- ⭐ Customer testimonials
- 💯 Money-back guarantee section
- ❓ FAQ section
- 🎯 Benefits grid
- 📱 Mobile-responsive design
- ⚡ Fast-loading optimized code

### Success Page Features:
- ✅ Animated success confirmation
- 📋 Order details display
- 📞 Direct WhatsApp contact button
- 🎊 Confetti celebration effect
- 📊 Conversion tracking

## 🚦 Testing

### Test the Payment Flow:
1. Visit `http://localhost:3001/sales.html`
2. Click on either "Start Nu Met Mentorship" or "Claim Je Done-For-You Pakket"
3. Fill in test card details:
   - Card: `4242 4242 4242 4242`
   - Date: Any future date
   - CVC: Any 3 digits
4. Complete the checkout
5. You'll be redirected to the success page

### Test UTM Tracking:
```
http://localhost:3001/sales.html?utm_source=test&utm_medium=qr&utm_campaign=test_campaign
```
Check browser console for UTM parameter detection logs.

## 📝 Webhook Setup (Production)

For production, configure Stripe webhook endpoint:
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in `.env`

## 🛡️ Security Notes

- Currently using LIVE Stripe keys - handle with care
- Never commit `.env` file to version control
- Use HTTPS in production
- Implement rate limiting for production
- Consider adding CSRF protection

## 📱 WhatsApp Integration

Update the WhatsApp number in `success.html`:
```javascript
// Line ~285
<a href="https://wa.me/31612345678?text=..." 
```
Replace `31612345678` with your actual WhatsApp business number.

## 🎨 Customization

### Colors
Main gradient colors are defined in CSS:
- Primary: `#667eea` to `#764ba2`
- Success: `#4CAF50`
- Urgent: `#ff6b6b`

### Content
All text content is in Dutch and can be modified directly in the HTML files.

## 📊 Monitoring

The server includes a health check endpoint:
```
GET http://localhost:3001/api/health
```

Returns:
```json
{
  "status": "OK",
  "stripe": true,
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## 🚀 Deployment

For production deployment:
1. Use a process manager like PM2
2. Set up SSL certificates
3. Configure a reverse proxy (nginx/Apache)
4. Update all URLs to use your domain
5. Test the complete payment flow
6. Monitor for errors and successful conversions

## 📞 Support

For issues or questions about the payment system, check:
- Stripe Dashboard for payment logs
- Browser console for client-side errors
- Server logs for backend issues
- Facebook Events Manager for pixel tracking
- Google Analytics for conversion tracking