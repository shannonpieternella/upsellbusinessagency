const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// MongoDB connection URL - using MongoDB Atlas free tier or local MongoDB
// Format: mongodb+srv://username:password@cluster.mongodb.net/database
// Or for local: mongodb://localhost:27017/leadscoding
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leadscoding';
const DATABASE_NAME = 'leadscoding';
const COLLECTION_NAME = 'email_subscribers';

let client;
let db;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        if (!client) {
            client = new MongoClient(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            await client.connect();
            console.log('Connected to MongoDB successfully');
            db = client.db(DATABASE_NAME);
        }
        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        // Return null if connection fails, app will still work without DB
        return null;
    }
}

// Save email subscriber to database
async function saveEmailSubscriber(data) {
    try {
        const database = await connectToDatabase();
        if (!database) {
            console.log('Database not available, skipping save');
            return { success: false, message: 'Database not available' };
        }

        const collection = database.collection(COLLECTION_NAME);
        
        // Prepare subscriber document
        const subscriber = {
            email: data.email.toLowerCase(),
            name: data.name || '',
            product: data.product || '',
            source: data.source || 'sales_funnel',
            marketingConsent: data.marketingConsent !== false, // Default to true
            utmParams: data.utmParams || {},
            metadata: {
                sessionId: data.sessionId || '',
                amount: data.amount || 0,
                currency: 'EUR',
                language: 'nl',
                ipAddress: data.ipAddress || '',
                userAgent: data.userAgent || ''
            },
            tags: data.tags || ['customer', data.product],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActivity: new Date(),
            emailsSent: 0,
            emailsOpened: 0,
            emailsClicked: 0,
            purchases: data.product ? [{
                product: data.product,
                amount: data.amount || 0,
                date: new Date(),
                sessionId: data.sessionId
            }] : [],
            notes: [],
            gdprConsent: {
                given: true,
                date: new Date(),
                ip: data.ipAddress || '',
                version: '1.0'
            }
        };

        // Check if email already exists
        const existingSubscriber = await collection.findOne({ email: subscriber.email });
        
        if (existingSubscriber) {
            // Update existing subscriber
            const updateData = {
                $set: {
                    updatedAt: new Date(),
                    lastActivity: new Date(),
                    name: subscriber.name || existingSubscriber.name,
                    marketingConsent: subscriber.marketingConsent
                },
                $addToSet: {
                    tags: { $each: subscriber.tags }
                }
            };

            // Add purchase if it's a new one
            if (data.product && data.sessionId) {
                updateData.$push = {
                    purchases: {
                        product: data.product,
                        amount: data.amount || 0,
                        date: new Date(),
                        sessionId: data.sessionId
                    }
                };
            }

            // Update UTM params if provided
            if (data.utmParams && Object.keys(data.utmParams).length > 0) {
                updateData.$set.utmParams = { ...existingSubscriber.utmParams, ...data.utmParams };
            }

            await collection.updateOne(
                { email: subscriber.email },
                updateData
            );

            console.log('Updated existing subscriber:', subscriber.email);
            return { 
                success: true, 
                message: 'Subscriber updated', 
                isNew: false,
                subscriberId: existingSubscriber._id 
            };
        } else {
            // Insert new subscriber
            const result = await collection.insertOne(subscriber);
            console.log('New subscriber added:', subscriber.email);
            return { 
                success: true, 
                message: 'New subscriber added', 
                isNew: true,
                subscriberId: result.insertedId 
            };
        }
    } catch (error) {
        console.error('Error saving email subscriber:', error);
        return { 
            success: false, 
            message: 'Error saving subscriber', 
            error: error.message 
        };
    }
}

// Get subscriber by email
async function getSubscriber(email) {
    try {
        const database = await connectToDatabase();
        if (!database) return null;

        const collection = database.collection(COLLECTION_NAME);
        return await collection.findOne({ email: email.toLowerCase() });
    } catch (error) {
        console.error('Error getting subscriber:', error);
        return null;
    }
}

// Update subscriber preferences
async function updateSubscriberPreferences(email, preferences) {
    try {
        const database = await connectToDatabase();
        if (!database) return { success: false };

        const collection = database.collection(COLLECTION_NAME);
        
        const updateData = {
            $set: {
                ...preferences,
                updatedAt: new Date()
            }
        };

        const result = await collection.updateOne(
            { email: email.toLowerCase() },
            updateData
        );

        return { 
            success: result.modifiedCount > 0,
            modifiedCount: result.modifiedCount 
        };
    } catch (error) {
        console.error('Error updating preferences:', error);
        return { success: false, error: error.message };
    }
}

// Unsubscribe user
async function unsubscribeEmail(email) {
    try {
        const database = await connectToDatabase();
        if (!database) return { success: false };

        const collection = database.collection(COLLECTION_NAME);
        
        const result = await collection.updateOne(
            { email: email.toLowerCase() },
            { 
                $set: { 
                    status: 'unsubscribed',
                    marketingConsent: false,
                    unsubscribedAt: new Date(),
                    updatedAt: new Date()
                } 
            }
        );

        return { 
            success: result.modifiedCount > 0,
            message: result.modifiedCount > 0 ? 'Successfully unsubscribed' : 'Email not found'
        };
    } catch (error) {
        console.error('Error unsubscribing:', error);
        return { success: false, error: error.message };
    }
}

// Get all active subscribers
async function getActiveSubscribers(filters = {}) {
    try {
        const database = await connectToDatabase();
        if (!database) return [];

        const collection = database.collection(COLLECTION_NAME);
        
        const query = {
            status: 'active',
            marketingConsent: true,
            ...filters
        };

        return await collection.find(query).toArray();
    } catch (error) {
        console.error('Error getting subscribers:', error);
        return [];
    }
}

// Track email event (open, click, etc.)
async function trackEmailEvent(email, eventType, metadata = {}) {
    try {
        const database = await connectToDatabase();
        if (!database) return { success: false };

        const collection = database.collection(COLLECTION_NAME);
        
        const updateData = {
            $set: {
                lastActivity: new Date(),
                updatedAt: new Date()
            },
            $push: {
                emailEvents: {
                    type: eventType,
                    date: new Date(),
                    metadata: metadata
                }
            }
        };

        // Increment counters based on event type
        if (eventType === 'sent') {
            updateData.$inc = { emailsSent: 1 };
        } else if (eventType === 'opened') {
            updateData.$inc = { emailsOpened: 1 };
        } else if (eventType === 'clicked') {
            updateData.$inc = { emailsClicked: 1 };
        }

        const result = await collection.updateOne(
            { email: email.toLowerCase() },
            updateData
        );

        return { success: result.modifiedCount > 0 };
    } catch (error) {
        console.error('Error tracking email event:', error);
        return { success: false, error: error.message };
    }
}

// Get statistics
async function getEmailStatistics() {
    try {
        const database = await connectToDatabase();
        if (!database) return null;

        const collection = database.collection(COLLECTION_NAME);
        
        const stats = await collection.aggregate([
            {
                $group: {
                    _id: null,
                    totalSubscribers: { $sum: 1 },
                    activeSubscribers: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    unsubscribed: {
                        $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] }
                    },
                    withConsent: {
                        $sum: { $cond: ['$marketingConsent', 1, 0] }
                    },
                    totalPurchases: { $sum: { $size: '$purchases' } },
                    totalRevenue: {
                        $sum: {
                            $reduce: {
                                input: '$purchases',
                                initialValue: 0,
                                in: { $add: ['$$value', '$$this.amount'] }
                            }
                        }
                    }
                }
            }
        ]).toArray();

        return stats[0] || {
            totalSubscribers: 0,
            activeSubscribers: 0,
            unsubscribed: 0,
            withConsent: 0,
            totalPurchases: 0,
            totalRevenue: 0
        };
    } catch (error) {
        console.error('Error getting statistics:', error);
        return null;
    }
}

// Close database connection
async function closeDatabaseConnection() {
    try {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    await closeDatabaseConnection();
    process.exit(0);
});

module.exports = {
    connectToDatabase,
    saveEmailSubscriber,
    getSubscriber,
    updateSubscriberPreferences,
    unsubscribeEmail,
    getActiveSubscribers,
    trackEmailEvent,
    getEmailStatistics,
    closeDatabaseConnection
};