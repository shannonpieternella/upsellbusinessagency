const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:8080'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Create Nodemailer transporter for Zoho Mail
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_HOST,
  port: parseInt(process.env.ZOHO_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('✉️  Email server is ready to send messages');
  }
});

// Serve main website
app.use(express.static(path.join(__dirname)));

// Serve AI demo static files
app.use('/ai-customer-service-demo', express.static(path.join(__dirname, 'ai-customer-service-demo/public')));

// Serve Healthcare scheduler static files
app.use('/healthcare-appointment-scheduler', express.static(path.join(__dirname, 'healthcare-appointment-scheduler')));

// Serve WaitSmart AI static files
app.use('/waitsmart-ai', express.static(path.join(__dirname, 'waitsmart-ai/public')));
app.use('/waitsmart-ai/css', express.static(path.join(__dirname, 'waitsmart-ai/public/css')));
app.use('/waitsmart-ai/js', express.static(path.join(__dirname, 'waitsmart-ai/public/js')));

// Import services for AI demo
const openAIService = require('./ai-customer-service-demo/server/services/openai');
const industryConfig = require('./ai-customer-service-demo/server/config/industries');
const mockDataService = require('./ai-customer-service-demo/server/services/mockData');

// Store active sessions
const activeSessions = new Map();
const activeTickets = new Map();

// Main website route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// AI Demo routes
app.get('/ai-customer-service-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-customer-service-demo/views/index.html'));
});

app.get('/ai-customer-service-demo/demo/:industry', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-customer-service-demo/views/demo.html'));
});

// WaitSmart AI route
app.get('/waitsmart-ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'waitsmart-ai/views/index.html'));
});

// Contact Form Handler
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, projectType, message } = req.body;
    
    // Create the email content
    const mailOptions = {
      from: `"Upsell Business Agency Website" <${process.env.ZOHO_EMAIL}>`,
      to: process.env.ZOHO_EMAIL,
      replyTo: email,
      subject: `Nieuwe aanvraag van ${name} - ${projectType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d, #2563eb); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #1a365d; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; }
            .message { white-space: pre-wrap; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Nieuwe Contact Aanvraag</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Naam:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Bedrijf:</div>
                <div class="value">${company || 'Niet opgegeven'}</div>
              </div>
              <div class="field">
                <div class="label">Project Type:</div>
                <div class="value">${projectType}</div>
              </div>
              <div class="field">
                <div class="label">Bericht:</div>
                <div class="value message">${message}</div>
              </div>
              <div class="footer">
                <p>Dit bericht is verzonden via het contactformulier op upsellbusinessagency.com</p>
                <p>Datum: ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nieuwe Contact Aanvraag

Naam: ${name}
Email: ${email}
Bedrijf: ${company || 'Niet opgegeven'}
Project Type: ${projectType}

Bericht:
${message}

---
Dit bericht is verzonden via het contactformulier op upsellbusinessagency.com
Datum: ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    // Also send auto-reply to the user
    const autoReplyOptions = {
      from: `"Upsell Business Agency" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: 'Bedankt voor uw bericht - Upsell Business Agency',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d, #2563eb); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Bedankt voor uw bericht!</h1>
            </div>
            <div class="content">
              <p>Beste ${name},</p>
              
              <p>Hartelijk dank voor uw interesse in Upsell Business Agency. We hebben uw bericht in goede orde ontvangen en zullen binnen 24 uur contact met u opnemen.</p>
              
              <p><strong>Wat kunt u verwachten?</strong></p>
              <ul>
                <li>Een persoonlijk gesprek over uw project</li>
                <li>Een gratis consultatie van 30 minuten</li>
                <li>Een op maat gemaakt voorstel voor uw situatie</li>
              </ul>
              
              <p>In de tussentijd kunt u alvast onze portfolio bekijken om een indruk te krijgen van onze werkwijze en mogelijkheden.</p>
              
              <center>
                <a href="https://upsellbusinessagency.com/#projects" class="button">Bekijk Portfolio</a>
              </center>
              
              <p>Met vriendelijke groet,<br>
              Het Upsell Business Agency Team</p>
              
              <div class="footer">
                <p>Upsell Business Agency | AI & Software Development Solutions</p>
                <p>info@upsellbusinessagency.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Beste ${name},

Hartelijk dank voor uw interesse in Upsell Business Agency. We hebben uw bericht in goede orde ontvangen en zullen binnen 24 uur contact met u opnemen.

Wat kunt u verwachten?
- Een persoonlijk gesprek over uw project
- Een gratis consultatie van 30 minuten
- Een op maat gemaakt voorstel voor uw situatie

In de tussentijd kunt u alvast onze portfolio bekijken om een indruk te krijgen van onze werkwijze en mogelijkheden.

Met vriendelijke groet,
Het Upsell Business Agency Team

---
Upsell Business Agency | AI & Software Development Solutions
info@upsellbusinessagency.com
      `
    };
    
    // Send auto-reply
    await transporter.sendMail(autoReplyOptions);
    
    res.json({ 
      success: true, 
      message: 'Bedankt voor uw bericht! We nemen binnen 24 uur contact met u op.' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Er ging iets mis. Probeer het later opnieuw.' 
    });
  }
});

// API Routes for AI Demo
app.post('/api/chat', async (req, res) => {
  try {
    const { message, industry, language, sessionId } = req.body;
    
    const response = await openAIService.generateAIResponse(
      message, 
      industry, 
      language,
      activeSessions.get(sessionId) || {}
    );
    
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, {
        industry,
        language: response.language,
        messages: []
      });
    }
    
    const session = activeSessions.get(sessionId);
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: response.message });
    
    io.to(`agents-${industry}`).emit('new-message', {
      sessionId,
      message,
      response: response.message,
      language: response.language,
      timestamp: new Date()
    });
    
    res.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Er ging iets mis / Something went wrong',
      message: error.message 
    });
  }
});

app.get('/api/industries', (req, res) => {
  const lang = req.query.lang || 'en';
  res.json(industryConfig.getIndustriesForLang(lang));
});

app.get('/api/industries/all', (req, res) => {
  res.json(industryConfig.data);
});

app.get('/api/tickets/:industry', (req, res) => {
  const { industry } = req.params;
  const lang = req.query.lang || 'en';
  
  if (!activeTickets.has(industry)) {
    activeTickets.set(industry, mockDataService.generateInitialTickets(industry, lang));
  }
  
  res.json(activeTickets.get(industry));
});

app.get('/api/analytics/:industry', (req, res) => {
  const { industry } = req.params;
  const lang = req.query.lang || 'en';
  
  res.json(mockDataService.generateAnalytics(industry, lang));
});

app.post('/api/email-response', async (req, res) => {
  try {
    const { message, subject, from, industry, language } = req.body;
    
    // Generate email-specific context
    const emailContext = `
You are responding to an email from ${from} with subject: "${subject}"

Original email:
${message}

Generate a professional email response that:
1. Addresses their specific question/concern
2. Provides helpful information
3. Includes a clear next step or call to action ONLY if the conversation needs to continue
4. Maintains a friendly, professional tone
5. Is formatted as a proper email with greeting and closing
6. NEVER include placeholder text like [Your Name] - sign off as the company team
7. If the customer is confirming/acknowledging (e.g., "alright", "ok", "ill be there", "thanks"), provide a brief confirmation without asking unnecessary follow-up questions
8. Recognize when a conversation is naturally ending and respond appropriately without forcing continuation
`;
    
    const response = await openAIService.generateAIResponse(
      emailContext,
      industry,
      language
    );
    
    res.json({ response: response.message });
  } catch (error) {
    console.error('Email API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate email response',
      message: error.message 
    });
  }
});

// Socket.io handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-industry', (data) => {
    const { industry, role } = data;
    socket.join(`${role}-${industry}`);
    console.log(`Client ${socket.id} joined ${role}-${industry}`);
    
    if (role === 'agent') {
      socket.emit('tickets-update', activeTickets.get(industry) || []);
    }
  });
  
  socket.on('agent-response', (data) => {
    const { sessionId, message, industry } = data;
    
    io.to(`customer-${sessionId}`).emit('agent-message', {
      message,
      timestamp: new Date()
    });
    
    updateTicketStatus(industry, sessionId, 'in-progress');
  });
  
  socket.on('resolve-ticket', (data) => {
    const { industry, ticketId } = data;
    updateTicketStatus(industry, ticketId, 'resolved');
    
    io.to(`agents-${industry}`).emit('ticket-resolved', ticketId);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper functions
function updateTicketStatus(industry, ticketId, status) {
  const tickets = activeTickets.get(industry);
  if (tickets) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
    }
  }
}

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Upsell Business Agency running on http://localhost:${PORT}`);
  console.log(`📍 Main website: http://localhost:${PORT}`);
  console.log(`🤖 AI Demo: http://localhost:${PORT}/ai-customer-service-demo`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = { app, io };