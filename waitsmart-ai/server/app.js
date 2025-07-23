// WaitSmart AI - Backend Server
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import services
const waitingListService = require('./services/waitingListService');
const prioritizationService = require('./services/prioritizationService');
const analyticsService = require('./services/analyticsService');
const coordinationService = require('./services/coordinationService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    }
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/waitsmart-ai', express.static(path.join(__dirname, '../public')));
app.use('/waitsmart-ai/css', express.static(path.join(__dirname, '../public/css')));
app.use('/waitsmart-ai/js', express.static(path.join(__dirname, '../public/js')));

// Routes
app.get('/waitsmart-ai', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// API Routes
app.get('/api/dashboard/metrics', (req, res) => {
    const metrics = waitingListService.getDashboardMetrics();
    res.json(metrics);
});

app.get('/api/waiting-list', (req, res) => {
    const { status, urgency, department } = req.query;
    const patients = waitingListService.getWaitingList({ status, urgency, department });
    res.json(patients);
});

app.post('/api/patients/:id/prioritize', (req, res) => {
    const { id } = req.params;
    const priority = prioritizationService.calculatePriority(id);
    res.json(priority);
});

app.get('/api/patients/:id/priority-factors', (req, res) => {
    const { id } = req.params;
    const factors = prioritizationService.getPriorityFactors(id);
    res.json(factors);
});

app.get('/api/analytics/forecast', (req, res) => {
    const { months = 6 } = req.query;
    const forecast = analyticsService.generateForecast(months);
    res.json(forecast);
});

app.get('/api/analytics/trends', (req, res) => {
    const { period = '6months' } = req.query;
    const trends = analyticsService.getTrends(period);
    res.json(trends);
});

app.get('/api/coordination/regional-capacity', (req, res) => {
    const capacity = coordinationService.getRegionalCapacity();
    res.json(capacity);
});

app.post('/api/coordination/transfer-suggestion', (req, res) => {
    const { fromHospital, patientCount } = req.body;
    const suggestions = coordinationService.generateTransferSuggestions(fromHospital, patientCount);
    res.json(suggestions);
});

app.get('/api/quality/data-validation', (req, res) => {
    const validation = waitingListService.validateDataQuality();
    res.json(validation);
});

app.post('/api/quality/fix-errors', (req, res) => {
    const { errors } = req.body;
    const fixed = waitingListService.fixDataErrors(errors);
    res.json({ fixed, message: 'Data errors fixed successfully' });
});

app.get('/api/reports/executive-summary', (req, res) => {
    const summary = analyticsService.generateExecutiveSummary();
    res.json(summary);
});

app.post('/api/communications/send-update', (req, res) => {
    const { patientId, message, channel } = req.body;
    // In a real app, this would send actual communications
    res.json({ 
        success: true, 
        message: `Update sent to patient ${patientId} via ${channel}` 
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏥 WaitSmart AI Server running on http://localhost:${PORT}/waitsmart-ai`);
});

module.exports = app;