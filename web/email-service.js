const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create Zoho Mail transporter
const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST || 'smtp.zoho.eu',
    port: process.env.ZOHO_PORT || 465,
    secure: true,
    auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD
    }
});

// Email templates
const emailTemplates = {
    mentorship: {
        subject: '🎉 Welkom bij het Mentorship Program - Jouw Transformatie Begint Nu!',
        html: (customerName, customerEmail) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 50px; margin: 20px 0; }
        .steps { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .step { padding: 10px; border-left: 3px solid #667eea; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
        h1 { margin: 0; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welkom ${customerName}! 🚀</h1>
            <p>Je hebt de eerste stap gezet naar jouw business transformatie</p>
        </div>
        
        <div class="content">
            <h2>Bedankt voor je vertrouwen in ons Mentorship Program!</h2>
            
            <p>Beste ${customerName},</p>
            
            <p>Super dat je hebt gekozen voor persoonlijke begeleiding! Ik kijk er naar uit om samen met jou aan je business te werken en je doelen te bereiken.</p>
            
            <div class="highlight">
                <strong>⏰ BELANGRIJK:</strong> Binnen 24 uur ontvang je van mij een persoonlijke appointment planner link om je eerste sessie in te plannen. Houd je inbox in de gaten!
            </div>
            
            <div class="steps">
                <h3>De volgende stappen:</h3>
                <div class="step">
                    <strong>Stap 1:</strong> Je ontvangt binnen 24 uur mijn Calendly link voor het plannen van je eerste sessie
                </div>
                <div class="step">
                    <strong>Stap 2:</strong> Kies een moment dat jou het beste uitkomt (sessies zijn 60 minuten)
                </div>
                <div class="step">
                    <strong>Stap 3:</strong> Je krijgt vooraf een intake formulier om je situatie in kaart te brengen
                </div>
                <div class="step">
                    <strong>Stap 4:</strong> We starten met een deep-dive sessie en maken direct je persoonlijke actieplan
                </div>
            </div>
            
            <h3>Wat je kunt verwachten:</h3>
            <ul>
                <li>✅ 1-op-1 video coaching sessies via Zoom</li>
                <li>✅ Persoonlijk actieplan op maat</li>
                <li>✅ 24/7 WhatsApp support voor vragen tussendoor</li>
                <li>✅ Toegang tot onze exclusive community</li>
                <li>✅ Wekelijkse Q&A groepscalls</li>
                <li>✅ Lifetime updates & nieuwe strategieën</li>
            </ul>
            
            <p><strong>Direct contact nodig?</strong></p>
            <p>Stuur me een WhatsApp bericht: <a href="https://wa.me/31612345678?text=Hi!%20Ik%20ben%20${encodeURIComponent(customerName)}%20en%20heb%20net%20het%20Mentorship%20Program%20gekocht!">+31 6 12345678</a></p>
            
            <center>
                <a href="https://wa.me/31612345678?text=Hi!%20Ik%20ben%20${encodeURIComponent(customerName)}%20en%20heb%20net%20het%20Mentorship%20Program%20gekocht!" class="button">
                    💬 Start WhatsApp Gesprek
                </a>
            </center>
            
            <p>Ik kijk er naar uit om met je samen te werken!</p>
            
            <p>Met ondernemende groet,<br>
            <strong>Shannon Pieternella</strong><br>
            Founder - Upsell Business Agency</p>
        </div>
        
        <div class="footer">
            <p>Je ontvangt deze email omdat je een aankoop hebt gedaan op onze website.</p>
            <p>Email: ${customerEmail} | Order: Mentorship Program</p>
            <p>© 2025 Upsell Business Agency - Alle rechten voorbehouden</p>
        </div>
    </div>
</body>
</html>
        `
    },
    doneForYou: {
        subject: '🎉 Welkom! Je Done-For-You Business Setup Begint Nu',
        html: (customerName, customerEmail) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 50px; margin: 20px 0; }
        .timeline { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .timeline-item { padding: 15px; border-left: 3px solid #4CAF50; margin: 15px 0; position: relative; }
        .timeline-item::before { content: '✓'; position: absolute; left: -12px; background: #4CAF50; color: white; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        h1 { margin: 0; }
        .highlight { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
        .bonus { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Gefeliciteerd ${customerName}! 🎊</h1>
            <p>Je Complete Business Setup wordt voor je geregeld!</p>
        </div>
        
        <div class="content">
            <h2>Welkom bij de Done-For-You Service!</h2>
            
            <p>Beste ${customerName},</p>
            
            <p>Wat geweldig dat je hebt gekozen voor onze Done-For-You service! Je hebt zojuist de beste beslissing genomen voor je business. Wij gaan ALLES voor je regelen, zodat jij je kunt focussen op wat echt belangrijk is.</p>
            
            <div class="highlight">
                <strong>🎯 ACTIE VEREIST:</strong> Binnen 24 uur ontvang je een appointment planner link voor je onboarding gesprek. Dit gesprek is cruciaal om je business perfect in te richten volgens jouw wensen!
            </div>
            
            <div class="timeline">
                <h3>Je Done-For-You Timeline:</h3>
                
                <div class="timeline-item">
                    <strong>Binnen 24 uur:</strong> Onboarding call planning
                    <p>Je ontvangt mijn Calendly link om een intake gesprek in te plannen (30-45 min)</p>
                </div>
                
                <div class="timeline-item">
                    <strong>Dag 1-3:</strong> Strategy & Design
                    <p>We werken je complete business strategie uit en starten met het design</p>
                </div>
                
                <div class="timeline-item">
                    <strong>Dag 4-7:</strong> Development
                    <p>Je website, funnel en systemen worden gebouwd</p>
                </div>
                
                <div class="timeline-item">
                    <strong>Dag 8-10:</strong> Testing & Optimalisatie
                    <p>Alles wordt getest en geoptimaliseerd voor maximale conversie</p>
                </div>
                
                <div class="timeline-item">
                    <strong>Dag 10-14:</strong> Launch & Training
                    <p>We lanceren alles en je krijgt een complete training</p>
                </div>
            </div>
            
            <h3>Wat we voor je gaan bouwen:</h3>
            <ul>
                <li>✅ Complete professionele website</li>
                <li>✅ High-converting sales funnel</li>
                <li>✅ Email marketing automatisering</li>
                <li>✅ Social media templates & content kalender</li>
                <li>✅ 30 dagen gratis advertentie management</li>
                <li>✅ Payment processing setup</li>
                <li>✅ Analytics & tracking installatie</li>
            </ul>
            
            <div class="bonus">
                <h3>🎁 BONUS: Je krijgt ook:</h3>
                <ul>
                    <li>€500 aan premium tools & software (lifetime deals)</li>
                    <li>3 maanden gratis nazorg & optimalisatie</li>
                    <li>Exclusive toegang tot onze VIP community</li>
                    <li>Maandelijkse group masterminds</li>
                </ul>
            </div>
            
            <p><strong>Direct aan de slag?</strong></p>
            <p>Stuur me een WhatsApp bericht en we kunnen direct beginnen!</p>
            
            <center>
                <a href="https://wa.me/31612345678?text=Hi!%20Ik%20ben%20${encodeURIComponent(customerName)}%20en%20heb%20net%20de%20Done-For-You%20service%20gekocht!" class="button">
                    💬 Start WhatsApp Gesprek
                </a>
            </center>
            
            <p><strong>Belangrijke informatie:</strong></p>
            <ul>
                <li>📧 Check je email dagelijks voor updates</li>
                <li>📱 Voeg mijn WhatsApp toe aan je contacten: +31 6 12345678</li>
                <li>📅 Blokkeer alvast 45 minuten in je agenda voor ons onboarding gesprek</li>
                <li>💡 Begin alvast na te denken over je business visie en doelgroep</li>
            </ul>
            
            <p>Ik kan niet wachten om jouw business naar het volgende niveau te tillen!</p>
            
            <p>Met ondernemende groet,<br>
            <strong>Shannon Pieternella</strong><br>
            Founder - Upsell Business Agency</p>
        </div>
        
        <div class="footer">
            <p>Je ontvangt deze email omdat je een aankoop hebt gedaan op onze website.</p>
            <p>Email: ${customerEmail} | Order: Done-For-You Complete Setup</p>
            <p>© 2025 Upsell Business Agency - Alle rechten voorbehouden</p>
        </div>
    </div>
</body>
</html>
        `
    }
};

// Send confirmation email function
async function sendConfirmationEmail(customerEmail, customerName, product) {
    try {
        const template = product === 'mentorship' ? emailTemplates.mentorship : emailTemplates.doneForYou;
        
        const mailOptions = {
            from: `"Upsell Business Agency" <${process.env.ZOHO_EMAIL}>`,
            to: customerEmail,
            subject: template.subject,
            html: template.html(customerName || 'Valued Customer', customerEmail)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

// Send admin notification
async function sendAdminNotification(orderDetails) {
    try {
        const { customerEmail, customerName, product, amount, sessionId, utm_params } = orderDetails;
        
        const adminHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .order-box { background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .highlight { background: #d4edda; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h2>🎉 Nieuwe Bestelling Ontvangen!</h2>
    
    <div class="order-box">
        <h3>Klant Informatie:</h3>
        <p><strong>Naam:</strong> ${customerName || 'Niet opgegeven'}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Product:</strong> ${product === 'mentorship' ? 'Mentorship Program' : 'Done-For-You Service'}</p>
        <p><strong>Bedrag:</strong> €${amount}</p>
        <p><strong>Order ID:</strong> ${sessionId}</p>
    </div>
    
    ${utm_params && Object.keys(utm_params).length > 0 ? `
    <div class="order-box">
        <h3>Marketing Tracking:</h3>
        <p><strong>UTM Source:</strong> ${utm_params.utm_source || '-'}</p>
        <p><strong>UTM Medium:</strong> ${utm_params.utm_medium || '-'}</p>
        <p><strong>UTM Campaign:</strong> ${utm_params.utm_campaign || '-'}</p>
        <p><strong>UTM Content:</strong> ${utm_params.utm_content || '-'}</p>
        <p><strong>UTM Term:</strong> ${utm_params.utm_term || '-'}</p>
    </div>
    ` : ''}
    
    <div class="highlight">
        <h3>⚡ Actie Vereist:</h3>
        <ol>
            <li>Stuur binnen 24 uur de appointment planner link</li>
            <li>Voeg klant toe aan CRM</li>
            <li>Stuur WhatsApp welkomstbericht</li>
        </ol>
    </div>
    
    <p>Direct contact: <a href="mailto:${customerEmail}">${customerEmail}</a></p>
</body>
</html>
        `;
        
        const mailOptions = {
            from: `"Order System" <${process.env.ZOHO_EMAIL}>`,
            to: process.env.ZOHO_EMAIL,
            subject: `💰 Nieuwe Order: ${product === 'mentorship' ? 'Mentorship' : 'Done-For-You'} - ${customerName || customerEmail}`,
            html: adminHtml
        };

        await transporter.sendMail(mailOptions);
        console.log('Admin notification sent');
    } catch (error) {
        console.error('Error sending admin notification:', error);
    }
}

module.exports = {
    sendConfirmationEmail,
    sendAdminNotification,
    transporter
};