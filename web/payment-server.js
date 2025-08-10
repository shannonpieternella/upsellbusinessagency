const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const stripe = require('stripe');
const { sendConfirmationEmail, sendAdminNotification } = require('./email-service');
const { saveEmailSubscriber, trackEmailEvent, connectToDatabase } = require('./database-service');

const app = express();
const PORT = process.env.PAYMENT_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CORS headers for API
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Initialize Stripe with live key
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { product, price, name, description, utm_params } = req.body;

        // Get the origin from the request
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const origin = `${protocol}://${host}`;

        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card', 'ideal', 'bancontact'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: name,
                            description: description,
                        },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
            cancel_url: `${origin}/sales.html?canceled=true`,
            metadata: {
                product: product,
                timestamp: new Date().toISOString(),
                ...(utm_params || {})
            },
            customer_email: null, // Will be collected by Stripe
            billing_address_collection: 'required',
            shipping_address_collection: product === 'done-for-you' ? {
                allowed_countries: ['NL', 'BE', 'DE', 'FR', 'GB', 'US'],
            } : undefined,
            submit_type: 'pay',
            locale: 'nl',
            allow_promotion_codes: true,
            payment_intent_data: {
                description: `Purchase: ${name}`,
                metadata: {
                    product: product
                }
            }
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ 
            error: 'Er ging iets mis bij het aanmaken van de betaalsessie', 
            details: error.message 
        });
    }
});

// Webhook endpoint for Stripe events
app.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeClient.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful for:', session.metadata.product);
            
            // Get full session details with line items
            const fullSession = await stripeClient.checkout.sessions.retrieve(
                session.id,
                { expand: ['customer_details', 'line_items'] }
            );
            
            // Send confirmation email to customer
            if (fullSession.customer_details?.email) {
                // Save to database
                await saveEmailSubscriber({
                    email: fullSession.customer_details.email,
                    name: fullSession.customer_details.name,
                    product: session.metadata.product,
                    amount: session.amount_total / 100,
                    sessionId: session.id,
                    source: 'stripe_checkout',
                    marketingConsent: true, // They checked out, so we assume consent
                    utmParams: {
                        utm_source: session.metadata.utm_source,
                        utm_medium: session.metadata.utm_medium,
                        utm_campaign: session.metadata.utm_campaign,
                        utm_content: session.metadata.utm_content,
                        utm_term: session.metadata.utm_term
                    },
                    tags: ['customer', 'paid', session.metadata.product]
                });

                // Send emails
                await sendConfirmationEmail(
                    fullSession.customer_details.email,
                    fullSession.customer_details.name,
                    session.metadata.product
                );
                
                // Track email sent event
                await trackEmailEvent(fullSession.customer_details.email, 'sent', {
                    type: 'confirmation',
                    product: session.metadata.product
                });
                
                // Send admin notification
                await sendAdminNotification({
                    customerEmail: fullSession.customer_details.email,
                    customerName: fullSession.customer_details.name,
                    product: session.metadata.product,
                    amount: session.amount_total / 100,
                    sessionId: session.id,
                    utm_params: {
                        utm_source: session.metadata.utm_source,
                        utm_medium: session.metadata.utm_medium,
                        utm_campaign: session.metadata.utm_campaign,
                        utm_content: session.metadata.utm_content,
                        utm_term: session.metadata.utm_term
                    }
                });
            }
            
            break;
            
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment received:', paymentIntent.amount / 100, 'EUR');
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Get session details (for success page)
app.get('/api/session/:sessionId', async (req, res) => {
    try {
        const session = await stripeClient.checkout.sessions.retrieve(req.params.sessionId);
        res.json({
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name,
            product: session.metadata?.product,
            amount: session.amount_total / 100
        });
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(404).json({ error: 'Session not found' });
    }
});

// Send email endpoint (for manual triggering after payment)
app.post('/api/send-confirmation-email', async (req, res) => {
    try {
        const { email, name, product, sessionId, marketingConsent } = req.body;
        
        if (!email || !product) {
            return res.status(400).json({ error: 'Email and product are required' });
        }
        
        // Save to database
        const dbResult = await saveEmailSubscriber({
            email: email,
            name: name || '',
            product: product,
            amount: product === 'mentorship' ? 45 : 999,
            sessionId: sessionId || 'manual-' + Date.now(),
            source: 'success_page',
            marketingConsent: marketingConsent !== false,
            utmParams: req.body.utmParams || {},
            tags: ['customer', 'paid', product],
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        
        // Send confirmation email
        const emailResult = await sendConfirmationEmail(email, name || 'Valued Customer', product);
        
        if (emailResult.success) {
            // Track email sent
            await trackEmailEvent(email, 'sent', {
                type: 'confirmation',
                product: product
            });
            
            // Also send admin notification
            await sendAdminNotification({
                customerEmail: email,
                customerName: name,
                product: product,
                amount: product === 'mentorship' ? 45 : 999,
                sessionId: sessionId || 'manual-trigger'
            });
            
            res.json({ 
                success: true, 
                message: 'Confirmation email sent successfully',
                messageId: emailResult.messageId,
                savedToDatabase: dbResult.success,
                isNewSubscriber: dbResult.isNew
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: emailResult.error 
            });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send email' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        stripe: !!process.env.STRIPE_SECRET_KEY,
        email: !!process.env.ZOHO_EMAIL,
        timestamp: new Date().toISOString() 
    });
});

// Serve the sales page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sales.html'));
});

// Serve the sales page on /sales route
app.get('/sales', (req, res) => {
    res.sendFile(path.join(__dirname, 'sales.html'));
});

// Start server
app.listen(PORT, async () => {
    console.log(`Payment server running on port ${PORT}`);
    console.log(`Sales page available at: http://localhost:${PORT}/sales.html`);
    console.log('Stripe mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 'TEST');
    
    // Initialize database connection
    const db = await connectToDatabase();
    if (db) {
        console.log('MongoDB connected successfully to leadscoding database');
    } else {
        console.log('MongoDB connection failed - app will work without database');
    }
});

module.exports = app;