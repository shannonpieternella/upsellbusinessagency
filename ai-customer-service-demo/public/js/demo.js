// Global variables
let socket;
let currentIndustry;
let currentLang = localStorage.getItem('preferredLang') || 'en';
let currentRole = 'customer';
let sessionId = generateSessionId();
let industryConfig = {};
let selectedTicket = null;
let charts = {};

// Translations
const demoTranslations = {
    en: {
        'demo.back': 'Back to Industries',
        'demo.status': 'Live Demo',
        'demo.tabs.customer': 'Customer',
        'demo.tabs.agent': 'Agent',
        'demo.tabs.manager': 'Manager',
        'demo.tabs.email': 'Email AI',
        'chat.status.online': 'Online - We typically reply instantly',
        'chat.today': 'Today',
        'chat.info.title': 'How it works',
        'chat.info.language.title': 'Language Detection',
        'chat.info.language.desc': 'Write in English or Dutch - the AI automatically detects and responds in your language',
        'chat.info.instant.title': 'Instant Responses',
        'chat.info.instant.desc': 'Get immediate, accurate answers powered by GPT-4 technology',
        'chat.info.context.title': 'Industry Context',
        'chat.info.context.desc': 'Responses are tailored to your selected industry with relevant information',
        'agent.title': 'Agent Dashboard',
        'agent.stats.active': 'Active',
        'agent.stats.response': 'Avg Response',
        'agent.stats.resolved': 'Resolved Today',
        'agent.tickets.title': 'Live Tickets',
        'agent.filter.all': 'All',
        'agent.filter.pending': 'Pending',
        'agent.filter.progress': 'In Progress',
        'agent.detail.title': 'Ticket Details',
        'agent.detail.empty': 'Select a ticket to view details',
        'agent.ai.title': 'AI Suggestions',
        'agent.ai.empty': 'AI suggestions will appear here',
        'manager.title': 'Manager Analytics',
        'manager.time.today': 'Today',
        'manager.time.week': 'This Week',
        'manager.time.month': 'This Month',
        'manager.kpi.response': 'Avg Response Time',
        'manager.kpi.satisfaction': 'Customer Satisfaction',
        'manager.kpi.tickets': 'Active Tickets',
        'manager.kpi.resolution': 'Resolution Rate',
        'manager.charts.tickets': 'Tickets by Hour',
        'manager.charts.language': 'Language Distribution',
        'manager.charts.satisfaction': 'Satisfaction by Language',
        'manager.charts.agents': 'Agent Performance',
        'manager.activity.title': 'Recent Activity',
        'email.title': 'AI Email Automation',
        'email.status': 'Connected to email server - Processing automatically',
        'email.integration.title': 'Email Server Integration',
        'email.integration.desc': 'This AI can connect directly to your email server (Gmail, Outlook, custom SMTP) and automatically respond to customer emails 24/7',
        'email.features.auto': 'Automatic email detection and response',
        'email.features.context': 'Context-aware responses based on email history',
        'email.features.multilang': 'Multi-language support (NL/EN)',
        'email.features.escalate': 'Smart escalation to human agents when needed',
        'email.simulation.title': 'Live Email Processing Simulation',
        'email.filters.all': 'All Industries',
        'email.filters.new': 'New Emails',
        'email.filters.replied': 'AI Replied',
        'email.inbox': 'Inbox',
        'email.select': 'Select an email to see AI response',
        'email.stats.title': 'Email Processing Statistics',
        'email.stats.total': 'Total Emails',
        'email.stats.replied': 'AI Replied',
        'email.stats.avgtime': 'Avg Response Time',
        'email.stats.accuracy': 'Accuracy Rate',
        'email.compose.title': 'Test AI Email Response',
        'email.compose.from': 'Your Email:',
        'email.compose.subject': 'Subject:',
        'email.compose.message': 'Message:',
        'email.compose.industry': 'Industry:',
        'email.compose.send': 'Send Test Email',
        'email.reply.title': 'Reply to this email:',
        'email.reply.send': 'Send Reply'
    },
    nl: {
        'demo.back': 'Terug naar Sectoren',
        'demo.status': 'Live Demo',
        'demo.tabs.customer': 'Klant',
        'demo.tabs.agent': 'Medewerker',
        'demo.tabs.manager': 'Manager',
        'demo.tabs.email': 'Email AI',
        'chat.status.online': 'Online - We reageren meestal direct',
        'chat.today': 'Vandaag',
        'chat.info.title': 'Hoe het werkt',
        'chat.info.language.title': 'Taaldetectie',
        'chat.info.language.desc': 'Schrijf in het Engels of Nederlands - de AI detecteert automatisch en antwoordt in uw taal',
        'chat.info.instant.title': 'Directe Antwoorden',
        'chat.info.instant.desc': 'Krijg onmiddellijke, accurate antwoorden aangedreven door GPT-4 technologie',
        'chat.info.context.title': 'Sector Context',
        'chat.info.context.desc': 'Antwoorden zijn afgestemd op uw geselecteerde sector met relevante informatie',
        'agent.title': 'Medewerker Dashboard',
        'agent.stats.active': 'Actief',
        'agent.stats.response': 'Gem. Reactie',
        'agent.stats.resolved': 'Opgelost Vandaag',
        'agent.tickets.title': 'Live Tickets',
        'agent.filter.all': 'Alle',
        'agent.filter.pending': 'Wachtend',
        'agent.filter.progress': 'In Behandeling',
        'agent.detail.title': 'Ticket Details',
        'agent.detail.empty': 'Selecteer een ticket om details te bekijken',
        'agent.ai.title': 'AI Suggesties',
        'agent.ai.empty': 'AI suggesties verschijnen hier',
        'manager.title': 'Manager Analytics',
        'manager.time.today': 'Vandaag',
        'manager.time.week': 'Deze Week',
        'manager.time.month': 'Deze Maand',
        'manager.kpi.response': 'Gem. Reactietijd',
        'manager.kpi.satisfaction': 'Klanttevredenheid',
        'manager.kpi.tickets': 'Actieve Tickets',
        'manager.kpi.resolution': 'Oplossingspercentage',
        'manager.charts.tickets': 'Tickets per Uur',
        'manager.charts.language': 'Taalverdeling',
        'manager.charts.satisfaction': 'Tevredenheid per Taal',
        'manager.charts.agents': 'Medewerker Prestaties',
        'manager.activity.title': 'Recente Activiteit',
        'email.title': 'AI Email Automatisering',
        'email.status': 'Verbonden met email server - Automatisch verwerken',
        'email.integration.title': 'Email Server Integratie',
        'email.integration.desc': 'Deze AI kan direct verbinden met uw email server (Gmail, Outlook, custom SMTP) en automatisch klant emails beantwoorden 24/7',
        'email.features.auto': 'Automatische email detectie en beantwoording',
        'email.features.context': 'Context-bewuste antwoorden gebaseerd op email geschiedenis',
        'email.features.multilang': 'Meertalige ondersteuning (NL/EN)',
        'email.features.escalate': 'Slimme doorverwijzing naar menselijke medewerkers indien nodig',
        'email.simulation.title': 'Live Email Verwerking Simulatie',
        'email.filters.all': 'Alle Sectoren',
        'email.filters.new': 'Nieuwe Emails',
        'email.filters.replied': 'AI Beantwoord',
        'email.inbox': 'Inbox',
        'email.select': 'Selecteer een email om AI antwoord te zien',
        'email.stats.title': 'Email Verwerkingsstatistieken',
        'email.stats.total': 'Totaal Emails',
        'email.stats.replied': 'AI Beantwoord',
        'email.stats.avgtime': 'Gem. Reactietijd',
        'email.stats.accuracy': 'Nauwkeurigheid',
        'email.compose.title': 'Test AI Email Antwoord',
        'email.compose.from': 'Uw Email:',
        'email.compose.subject': 'Onderwerp:',
        'email.compose.message': 'Bericht:',
        'email.compose.industry': 'Sector:',
        'email.compose.send': 'Verstuur Test Email',
        'email.reply.title': 'Antwoord op deze email:',
        'email.reply.send': 'Verstuur Antwoord'
    }
};

// Generate session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Language detection function
function detectLanguage(message) {
    const dutchKeywords = ['ik', 'het', 'een', 'van', 'op', 'voor', 'met', 'aan', 'door', 'bij', 'dat', 'deze', 'niet', 'maar', 'wel', 'ook', 'als', 'dan'];
    const englishKeywords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'his', 'has', 'had', 'were'];
    
    const words = message.toLowerCase().split(/\s+/);
    let dutchScore = 0;
    let englishScore = 0;
    
    words.forEach(word => {
        if (dutchKeywords.includes(word)) dutchScore++;
        if (englishKeywords.includes(word)) englishScore++;
    });
    
    return dutchScore > englishScore ? 'nl' : 'en';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Get industry from URL
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/');
    currentIndustry = pathParts[pathParts.length - 1];
    
    // Set language from URL or storage
    if (urlParams.get('lang')) {
        currentLang = urlParams.get('lang');
        localStorage.setItem('preferredLang', currentLang);
    }
    
    // Initialize socket connection
    initializeSocket();
    
    // Load industry configuration
    await loadIndustryConfig();
    
    // Update language
    updateDemoLanguage(currentLang);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize role view
    showRole('customer');
    
    // Load initial data based on role
    loadRoleData();
});

// Initialize Socket.io
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join-industry', { industry: currentIndustry, role: currentRole });
    });
    
    socket.on('new-message', (data) => {
        if (currentRole === 'agent') {
            updateTicketsList();
        }
    });
    
    socket.on('tickets-update', (tickets) => {
        if (currentRole === 'agent') {
            renderTickets(tickets);
        }
    });
    
    socket.on('analytics-update', (data) => {
        if (currentRole === 'manager') {
            updateAnalytics(data);
        }
    });
}

// Load industry configuration
async function loadIndustryConfig() {
    try {
        const response = await fetch(`/api/industries?lang=${currentLang}`);
        const industries = await response.json();
        industryConfig = industries[currentIndustry];
        
        // Update UI with industry info
        document.getElementById('industryIcon').textContent = industryConfig.icon;
        document.getElementById('industryTitle').textContent = industryConfig.name;
        document.getElementById('companyIcon').textContent = industryConfig.icon;
        document.getElementById('companyName').textContent = industryConfig.name;
        
        // Load industry-specific welcome message
        loadWelcomeMessage();
        
        // Load quick suggestions
        loadQuickSuggestions();
    } catch (error) {
        console.error('Error loading industry config:', error);
    }
}

// Load welcome message
async function loadWelcomeMessage() {
    const welcomeMessages = {
        en: {
            healthcare: "Hello! Welcome to our dental practice. How can I help you today?",
            ecommerce: "Hi there! Welcome to TrendyStyle. How can I assist you with your shopping today?",
            realestate: "Welcome to PropertyExpert! I'm here to help with all your real estate needs.",
            energy: "Hello! Welcome to GreenPower Energy. How can I help you with your energy needs?",
            automotive: "Welcome to AutoService Center! How can I assist you with your vehicle today?",
            hospitality: "Buongiorno! Welcome to La Bella Vista. How may I help you today?",
            financial: "Welcome to FinanceFirst Advisors. How can I assist you with your financial needs?",
            education: "Hi! Welcome to TechCollege. How can I help you with your learning journey?"
        },
        nl: {
            healthcare: "Hallo! Welkom bij onze tandartspraktijk. Hoe kan ik u vandaag helpen?",
            ecommerce: "Hoi! Welkom bij TrendyStyle. Hoe kan ik u helpen met winkelen vandaag?",
            realestate: "Welkom bij VastgoedXpert! Ik help u graag met al uw vastgoedvragen.",
            energy: "Hallo! Welkom bij GreenPower Energie. Hoe kan ik u helpen met uw energievragen?",
            automotive: "Welkom bij AutoService Centrum! Hoe kan ik u helpen met uw voertuig?",
            hospitality: "Buongiorno! Welkom bij La Bella Vista. Hoe kan ik u vandaag helpen?",
            financial: "Welkom bij FinanceFirst Adviseurs. Hoe kan ik u helpen met uw financiële vragen?",
            education: "Hoi! Welkom bij TechCollege. Hoe kan ik u helpen met uw leertraject?"
        }
    };
    
    document.getElementById('welcomeMessage').textContent = 
        welcomeMessages[currentLang][currentIndustry] || welcomeMessages[currentLang].healthcare;
}

// Load quick suggestions
async function loadQuickSuggestions() {
    try {
        const response = await fetch(`/api/industries?lang=${currentLang}`);
        const industries = await response.json();
        const industry = industries[currentIndustry];
        
        // This would come from the server in a real implementation
        const suggestions = getQuickSuggestionsForIndustry(currentIndustry, currentLang);
        
        const container = document.getElementById('quickSuggestions');
        container.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.onclick = () => sendMessage(suggestion);
            container.appendChild(chip);
        });
    } catch (error) {
        console.error('Error loading suggestions:', error);
    }
}

// Get quick suggestions (mock data)
function getQuickSuggestionsForIndustry(industry, lang) {
    const suggestions = {
        en: {
            healthcare: ["Book appointment", "Tooth pain", "Insurance coverage", "Opening hours", "Emergency care"],
            ecommerce: ["Track my order", "Return policy", "Size guide", "Payment methods", "Shipping info"],
            realestate: ["Schedule viewing", "Property listings", "Mortgage advice", "Rental options", "Selling process"],
            energy: ["Switch provider", "Submit meter reading", "Solar panels", "Bill explanation", "Contract info"],
            automotive: ["Book service", "Get quote", "MOT booking", "Emergency help", "Warranty check"],
            hospitality: ["Book table", "View menu", "Dietary options", "Event booking", "Opening hours"],
            financial: ["Book consultation", "Investment options", "Tax advice", "Pension planning", "Mortgage help"],
            education: ["Course enrollment", "Technical support", "Certificate info", "Payment plans", "Career guidance"]
        },
        nl: {
            healthcare: ["Afspraak maken", "Kiespijn", "Verzekering dekking", "Openingstijden", "Spoedzorg"],
            ecommerce: ["Bestelling volgen", "Retourbeleid", "Maattabel", "Betaalmethoden", "Verzendinfo"],
            realestate: ["Bezichtiging plannen", "Woningaanbod", "Hypotheek advies", "Huur opties", "Verkoop proces"],
            energy: ["Overstappen", "Meterstand doorgeven", "Zonnepanelen", "Factuur uitleg", "Contract info"],
            automotive: ["Service boeken", "Offerte aanvragen", "APK plannen", "Pech hulp", "Garantie check"],
            hospitality: ["Tafel reserveren", "Menu bekijken", "Dieet opties", "Event boeken", "Openingstijden"],
            financial: ["Consult boeken", "Belegging opties", "Belasting advies", "Pensioen planning", "Hypotheek hulp"],
            education: ["Cursus inschrijven", "Technische support", "Certificaat info", "Betaalplannen", "Carrière advies"]
        }
    };
    
    return suggestions[lang][industry] || suggestions[lang].healthcare;
}

// Setup event listeners
function setupEventListeners() {
    // Language toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            updateDemoLanguage(lang);
            loadIndustryConfig();
        });
    });
    
    // Role tabs
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const role = tab.getAttribute('data-role');
            showRole(role);
        });
    });
    
    // Chat form
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterTickets(filter);
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Time filter buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const range = btn.getAttribute('data-range');
            loadAnalyticsForRange(range);
            
            // Update active state
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Update demo language
function updateDemoLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    
    // Update translated elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (demoTranslations[lang][key]) {
            element.textContent = demoTranslations[lang][key];
        }
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    // Update chat placeholder
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.placeholder = chatInput.getAttribute(`data-placeholder-${lang}`);
    }
    
    // Update language indicator
    const langIndicator = document.getElementById('chatLanguageIndicator');
    if (langIndicator) {
        langIndicator.textContent = lang === 'en' ? '🇬🇧' : '🇳🇱';
    }
}

// Show role view
function showRole(role) {
    currentRole = role;
    
    // Update tabs
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-role') === role);
    });
    
    // Update views
    document.querySelectorAll('.role-view').forEach(view => {
        view.classList.remove('active');
    });
    
    const viewMap = {
        customer: 'customerView',
        agent: 'agentView',
        manager: 'managerView',
        email: 'emailView'
    };
    
    document.getElementById(viewMap[role]).classList.add('active');
    
    // Rejoin socket room
    if (socket) {
        socket.emit('join-industry', { industry: currentIndustry, role: currentRole });
    }
    
    // Load role-specific data
    loadRoleData();
}

// Load role-specific data
async function loadRoleData() {
    switch (currentRole) {
        case 'customer':
            // Customer view is already loaded
            break;
        case 'agent':
            await loadAgentDashboard();
            break;
        case 'manager':
            await loadManagerDashboard();
            break;
        case 'email':
            await loadEmailDashboard();
            break;
    }
}

// Handle chat submit
async function handleChatSubmit(e) {
    e.preventDefault();
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'customer');
    
    // Clear input
    input.value = '';
    
    // Hide quick suggestions after first message
    document.getElementById('quickSuggestions').style.display = 'none';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        // Send message to server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                industry: currentIndustry,
                language: currentLang,
                sessionId
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add AI response
        addMessageToChat(data.message, 'ai');
        
        // Update language indicator if changed
        if (data.language !== currentLang) {
            currentLang = data.language;
            document.getElementById('chatLanguageIndicator').textContent = 
                data.language === 'en' ? '🇬🇧' : '🇳🇱';
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator(typingId);
        addMessageToChat(
            currentLang === 'en' 
                ? 'Sorry, I encountered an error. Please try again.'
                : 'Sorry, er is een fout opgetreden. Probeer het opnieuw.',
            'ai'
        );
    }
}

// Send message (from quick suggestion)
function sendMessage(message) {
    document.getElementById('chatInput').value = message;
    document.getElementById('chatForm').dispatchEvent(new Event('submit'));
}

// Add message to chat
function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'customer' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const text = document.createElement('p');
    text.textContent = message;
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    content.appendChild(text);
    content.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

// Add typing indicator
function addTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai typing';
    messageDiv.id = 'typing-' + Date.now();
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `
        <span class="typing-indicator">
            <span></span><span></span><span></span>
        </span>
    `;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv.id;
}

// Remove typing indicator
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// Load agent dashboard
async function loadAgentDashboard() {
    try {
        const response = await fetch(`/api/tickets/${currentIndustry}?lang=${currentLang}`);
        const tickets = await response.json();
        
        renderTickets(tickets);
        updateAgentStats(tickets);
    } catch (error) {
        console.error('Error loading agent dashboard:', error);
    }
}

// Render tickets
function renderTickets(tickets) {
    const container = document.getElementById('ticketsList');
    container.innerHTML = '';
    
    tickets.forEach(ticket => {
        const ticketEl = createTicketElement(ticket);
        container.appendChild(ticketEl);
    });
}

// Create ticket element
function createTicketElement(ticket) {
    const div = document.createElement('div');
    div.className = 'ticket-item';
    div.onclick = () => selectTicket(ticket);
    
    const priorityClass = `priority-${ticket.priority}`;
    const timeAgo = getTimeAgo(new Date(ticket.createdAt), currentLang);
    
    div.innerHTML = `
        <div class="ticket-header">
            <span class="ticket-customer">${ticket.customerName}</span>
            <span class="ticket-time">${timeAgo}</span>
        </div>
        <p class="ticket-message">${ticket.content}</p>
        <div class="ticket-footer">
            <span class="ticket-lang">${ticket.language === 'en' ? '🇬🇧' : '🇳🇱'}</span>
            <span class="ticket-priority ${priorityClass}">${ticket.priority}</span>
        </div>
    `;
    
    return div;
}

// Get time ago
function getTimeAgo(date, lang) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) {
        return lang === 'en' ? 'Just now' : 'Zojuist';
    } else if (minutes < 60) {
        return lang === 'en' ? `${minutes}m ago` : `${minutes}m geleden`;
    } else if (hours < 24) {
        return lang === 'en' ? `${hours}h ago` : `${hours}u geleden`;
    } else {
        return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'nl-NL');
    }
}

// Update agent stats
function updateAgentStats(tickets) {
    const active = tickets.filter(t => t.status !== 'resolved').length;
    const resolved = tickets.filter(t => 
        t.status === 'resolved' && 
        new Date(t.updatedAt).toDateString() === new Date().toDateString()
    ).length;
    
    const avgResponseTime = tickets
        .filter(t => t.responseTime)
        .reduce((sum, t) => sum + t.responseTime, 0) / tickets.length || 0;
    
    document.getElementById('activeTickets').textContent = active;
    document.getElementById('avgResponseTime').textContent = Math.round(avgResponseTime) + 's';
    document.getElementById('resolvedToday').textContent = resolved;
}

// Select ticket
async function selectTicket(ticket) {
    selectedTicket = ticket;
    
    // Update active state
    document.querySelectorAll('.ticket-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Show ticket detail
    const detailContainer = document.getElementById('ticketDetail');
    detailContainer.innerHTML = `
        <div class="ticket-detail-content">
            <div class="detail-header">
                <h4>${ticket.customerName}</h4>
                <span class="ticket-lang">${ticket.language === 'en' ? '🇬🇧' : '🇳🇱'}</span>
            </div>
            <div class="detail-message">
                <p>${ticket.content}</p>
                <span class="detail-time">${new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="handleTicket('${ticket.id}')">
                    ${currentLang === 'en' ? 'Handle Ticket' : 'Ticket Behandelen'}
                </button>
                <button class="btn btn-secondary" onclick="escalateTicket('${ticket.id}')">
                    ${currentLang === 'en' ? 'Escalate' : 'Escaleren'}
                </button>
            </div>
        </div>
    `;
    
    // Get AI suggestions
    const suggestionsContainer = document.getElementById('aiSuggestions');
    suggestionsContainer.innerHTML = '<div class="loading">Generating AI suggestions...</div>';
    
    // Simulate AI suggestion (in real app, this would call the server)
    setTimeout(() => {
        const suggestions = generateAISuggestions(ticket);
        suggestionsContainer.innerHTML = `
            <div class="suggestions-list">
                ${suggestions.map(s => `
                    <div class="suggestion-item">
                        <p>${s.text}</p>
                        <button class="use-suggestion-btn" onclick="useSuggestion('${s.text}')">
                            ${currentLang === 'en' ? 'Use' : 'Gebruik'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }, 1000);
}

// Generate AI suggestions (mock)
function generateAISuggestions(ticket) {
    const suggestions = {
        en: {
            appointment: [
                { text: "I'd be happy to help you schedule an appointment. Our next available slot is tomorrow at 2:00 PM. Would that work for you?" },
                { text: "Let me check our appointment system for you. We have openings on Monday at 10:00 AM or Tuesday at 3:00 PM. Which would you prefer?" }
            ],
            complaint: [
                { text: "I sincerely apologize for the inconvenience you've experienced. Let me look into this immediately and find a solution for you." },
                { text: "I understand your frustration and I'm here to help resolve this issue. Can you provide me with your order/account number so I can investigate?" }
            ],
            general: [
                { text: "Thank you for reaching out. I'll be happy to assist you with this. Let me gather some information to better help you." },
                { text: "I understand your question. Let me provide you with the most accurate information about this." }
            ]
        },
        nl: {
            appointment: [
                { text: "Ik help u graag met het maken van een afspraak. Ons eerstvolgende beschikbare moment is morgen om 14:00 uur. Past dat bij u?" },
                { text: "Laat me ons afsprakensysteem voor u checken. We hebben plek op maandag om 10:00 uur of dinsdag om 15:00 uur. Wat heeft uw voorkeur?" }
            ],
            complaint: [
                { text: "Mijn oprechte excuses voor het ongemak dat u heeft ervaren. Laat me dit direct onderzoeken en een oplossing voor u vinden." },
                { text: "Ik begrijp uw frustratie en ik ben hier om dit probleem op te lossen. Kunt u mij uw bestel-/accountnummer geven zodat ik het kan onderzoeken?" }
            ],
            general: [
                { text: "Bedankt voor uw bericht. Ik help u hier graag mee. Laat me wat informatie verzamelen om u beter te kunnen helpen." },
                { text: "Ik begrijp uw vraag. Laat me u de meest accurate informatie hierover geven." }
            ]
        }
    };
    
    // Determine type based on content
    let type = 'general';
    const content = ticket.content.toLowerCase();
    if (content.includes('appointment') || content.includes('afspraak') || content.includes('book')) {
        type = 'appointment';
    } else if (content.includes('complaint') || content.includes('klacht') || content.includes('problem')) {
        type = 'complaint';
    }
    
    return suggestions[ticket.language][type] || suggestions[ticket.language].general;
}

// Filter tickets
function filterTickets(filter) {
    const tickets = document.querySelectorAll('.ticket-item');
    tickets.forEach(ticket => {
        if (filter === 'all') {
            ticket.style.display = 'block';
        } else {
            // In real app, would filter based on ticket status
            ticket.style.display = Math.random() > 0.5 ? 'block' : 'none';
        }
    });
}

// Load manager dashboard
async function loadManagerDashboard() {
    try {
        const response = await fetch(`/api/analytics/${currentIndustry}?lang=${currentLang}`);
        const analytics = await response.json();
        
        updateAnalytics(analytics);
        createCharts(analytics);
        renderActivityFeed(analytics.recentActivity);
        renderAgentPerformance(analytics.agentPerformance);
    } catch (error) {
        console.error('Error loading manager dashboard:', error);
    }
}

// Update analytics
function updateAnalytics(data) {
    // Update KPIs
    const kpis = data.kpis;
    
    document.getElementById('avgResponseTimeKPI').textContent = `${kpis.avgResponseTime.value}${kpis.avgResponseTime.unit}`;
    document.getElementById('responseTimeTrend').textContent = Math.abs(kpis.avgResponseTime.change);
    
    document.getElementById('satisfactionRate').textContent = `${kpis.satisfaction.value}${kpis.satisfaction.unit}`;
    document.getElementById('satisfactionTrend').textContent = Math.abs(kpis.satisfaction.change);
    
    document.getElementById('totalTickets').textContent = kpis.activeTickets.value;
    const ticketTrend = document.getElementById('ticketsTrend');
    ticketTrend.innerHTML = kpis.activeTickets.trend === 'up' 
        ? `↑ <span>${Math.abs(kpis.activeTickets.change)}</span>`
        : `↓ <span>${Math.abs(kpis.activeTickets.change)}</span>`;
    ticketTrend.className = `kpi-trend ${kpis.activeTickets.trend}`;
    
    document.getElementById('resolutionRate').textContent = `${kpis.resolutionRate.value}${kpis.resolutionRate.unit}`;
    document.getElementById('resolutionTrend').textContent = Math.abs(kpis.resolutionRate.change);
}

// Create charts
function createCharts(data) {
    // Destroy existing charts
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};
    
    // Chart colors
    const chartColors = {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    // Tickets by Hour Chart
    const ticketsCtx = document.getElementById('ticketsByHourChart').getContext('2d');
    charts.ticketsByHour = new Chart(ticketsCtx, {
        type: 'line',
        data: {
            labels: data.charts.ticketsByHour.data.map(d => `${d.hour}:00`),
            datasets: [{
                label: currentLang === 'en' ? 'Tickets' : 'Tickets',
                data: data.charts.ticketsByHour.data.map(d => d.tickets),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + '20',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    // Language Distribution Chart
    const langCtx = document.getElementById('languageChart').getContext('2d');
    charts.language = new Chart(langCtx, {
        type: 'doughnut',
        data: {
            labels: data.charts.languageDistribution.data.map(d => d.language),
            datasets: [{
                data: data.charts.languageDistribution.data.map(d => d.percentage),
                backgroundColor: [chartColors.primary, chartColors.secondary]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });
    
    // Satisfaction by Language Chart
    const satCtx = document.getElementById('satisfactionByLangChart').getContext('2d');
    charts.satisfaction = new Chart(satCtx, {
        type: 'bar',
        data: {
            labels: data.charts.satisfactionByLanguage.data.map(d => d.language),
            datasets: [{
                label: currentLang === 'en' ? 'Satisfaction %' : 'Tevredenheid %',
                data: data.charts.satisfactionByLanguage.data.map(d => d.satisfaction),
                backgroundColor: [chartColors.success, chartColors.success]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Render activity feed
function renderActivityFeed(activities) {
    const container = document.getElementById('activityList');
    container.innerHTML = '';
    
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const timeAgo = getTimeAgo(new Date(activity.timestamp), currentLang);
        
        item.innerHTML = `
            <span class="activity-icon">${activity.icon}</span>
            <div class="activity-content">
                <p class="activity-message">${activity.message}</p>
                <span class="activity-time">${timeAgo}</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Render agent performance
function renderAgentPerformance(agents) {
    const container = document.getElementById('agentsTable');
    
    const table = document.createElement('table');
    table.className = 'agents-performance-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>${currentLang === 'en' ? 'Agent' : 'Medewerker'}</th>
                <th>${currentLang === 'en' ? 'Status' : 'Status'}</th>
                <th>${currentLang === 'en' ? 'Tickets' : 'Tickets'}</th>
                <th>${currentLang === 'en' ? 'Avg Time' : 'Gem. Tijd'}</th>
                <th>${currentLang === 'en' ? 'Satisfaction' : 'Tevredenheid'}</th>
            </tr>
        </thead>
        <tbody>
            ${agents.map(agent => `
                <tr>
                    <td>${agent.name}</td>
                    <td>
                        <span class="status-badge ${agent.status}">
                            ${agent.status === 'online' 
                                ? (currentLang === 'en' ? 'Online' : 'Online')
                                : (currentLang === 'en' ? 'Offline' : 'Offline')}
                        </span>
                    </td>
                    <td>${agent.ticketsHandled}</td>
                    <td>${agent.avgResponseTime}s</td>
                    <td>${agent.satisfaction}%</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

// Additional styles for agent table
const style = document.createElement('style');
style.textContent = `
    .agents-performance-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .agents-performance-table th,
    .agents-performance-table td {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .agents-performance-table th {
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .status-badge.online {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }
    
    .status-badge.offline {
        background: rgba(161, 161, 170, 0.2);
        color: #a1a1aa;
    }
    
    .loading {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }
    
    .suggestions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .suggestion-item {
        background: var(--dark-tertiary);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }
    
    .suggestion-item p {
        margin-bottom: 0.75rem;
    }
    
    .use-suggestion-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: var(--transition);
    }
    
    .use-suggestion-btn:hover {
        background: var(--secondary-color);
    }
    
    .ticket-detail-content {
        padding: 1.5rem;
    }
    
    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .detail-message {
        background: var(--dark-tertiary);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }
    
    .detail-message p {
        margin-bottom: 0.5rem;
    }
    
    .detail-time {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    
    .detail-actions {
        display: flex;
        gap: 1rem;
    }
`;
document.head.appendChild(style);

// Email Dashboard Functions
let emailList = [];
let selectedEmail = null;
let allIndustries = {};

async function loadEmailDashboard() {
    // Load all industries data with full configuration
    try {
        const response = await fetch('/api/industries/all');
        const industriesData = await response.json();
        
        // Transform to simpler format for display
        allIndustries = {};
        Object.keys(industriesData).forEach(key => {
            allIndustries[key] = {
                name: industriesData[key].company.name[currentLang],
                icon: industriesData[key].icon
            };
        });
    } catch (error) {
        console.error('Error loading industries:', error);
    }
    
    // Generate mock emails for different industries
    generateMockEmails();
    renderEmailList();
    updateEmailStats();
    
    // Setup email filters - remove previous listeners first
    document.querySelectorAll('#emailView .filter-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = newBtn.getAttribute('data-filter');
            filterEmails(filter);
            
            // Update active state
            document.querySelectorAll('#emailView .filter-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
        });
    });
    
    // Setup email compose form - remove previous listener first
    const emailForm = document.getElementById('emailComposeForm');
    if (emailForm) {
        const newForm = emailForm.cloneNode(true);
        emailForm.parentNode.replaceChild(newForm, emailForm);
        newForm.addEventListener('submit', handleEmailCompose);
    }
}

async function handleEmailCompose(e) {
    e.preventDefault();
    
    const from = document.getElementById('emailFrom').value;
    const subject = document.getElementById('emailSubject').value;
    const message = document.getElementById('emailMessage').value;
    const industry = currentIndustry; // Use current industry from the page
    
    // Create new email
    const newEmail = {
        id: emailList.length + 1,
        industry: industry,
        from: from,
        subject: subject,
        message: message,
        timestamp: new Date(),
        replied: false,
        aiResponse: null,
        responseTime: null
    };
    
    // Add to email list (at the beginning)
    emailList.unshift(newEmail);
    renderEmailList();
    
    // Clear form
    e.target.reset();
    
    // Auto-select the new email
    selectEmail(newEmail);
}

function generateMockEmails() {
    // Only show 3 example emails initially
    const emailTemplates = [
        { 
            industry: 'healthcare',
            subject: 'Appointment Request', 
            from: 'jan.de.vries@email.nl', 
            message: 'I would like to schedule a dental check-up for next week.' 
        },
        { 
            industry: 'ecommerce',
            subject: 'Order Status #12345', 
            from: 'anna.jansen@email.com', 
            message: 'Where is my order? I placed it 3 days ago and no updates.' 
        },
        { 
            industry: 'realestate',
            subject: 'Property Viewing Request', 
            from: 'mark.smit@email.nl', 
            message: 'I am interested in the apartment on Herengracht. Can we schedule a viewing?' 
        }
    ];
    
    emailList = [];
    let id = 1;
    
    // Generate only a few example emails
    emailTemplates.forEach((template, index) => {
        const email = {
            id: id++,
            industry: template.industry,
            from: template.from,
            subject: template.subject,
            message: template.message,
            timestamp: new Date(Date.now() - (index + 1) * 3600000), // 1, 2, 3 hours ago
            replied: false,
            aiResponse: null,
            responseTime: null
        };
        emailList.push(email);
    });
}

function generateAIEmailResponse(originalMessage, industry) {
    const responses = {
        healthcare: {
            appointment: "Dear customer,\\n\\nThank you for your appointment request. We have availability next Tuesday at 14:00 or Thursday at 10:00. Please let me know which time works best for you.\\n\\nYou can also book directly through our online system at [booking link].\\n\\nBest regards,\\nDental Practice Team",
            pain: "Dear customer,\\n\\nI'm sorry to hear about your tooth pain. We understand this is urgent and have reserved an emergency slot for you today at 15:30.\\n\\nPlease call us immediately at 0800-DENTAL to confirm, or reply to this email.\\n\\nBest regards,\\nDental Practice Team",
            insurance: "Dear customer,\\n\\nRegarding your insurance coverage with CZ: teeth whitening is partially covered (50%) under your current plan. The treatment costs €450, so you would pay €225.\\n\\nWould you like to schedule a consultation to discuss the treatment?\\n\\nBest regards,\\nDental Practice Team"
        },
        ecommerce: {
            order: "Dear customer,\\n\\nThank you for contacting us about order #12345. I've checked the status: your package is currently with PostNL and will be delivered tomorrow between 14:00-18:00.\\n\\nTrack your order: [tracking link]\\n\\nBest regards,\\nCustomer Service Team",
            return: "Dear customer,\\n\\nI understand the shoes don't fit. No worries! I've emailed you a prepaid return label. Simply:\\n1. Print the label\\n2. Pack the shoes in original box\\n3. Drop off at any PostNL point\\n\\nRefund will be processed within 5 days of receipt.\\n\\nBest regards,\\nCustomer Service Team",
            availability: "Dear customer,\\n\\nGood news! The Nike Air Max in size 42 will be back in stock this Friday. I can reserve a pair for you - shall I do that?\\n\\nYou'll receive an email as soon as they arrive.\\n\\nBest regards,\\nCustomer Service Team"
        },
        realestate: {
            viewing: "Dear customer,\\n\\nThank you for your interest in the Herengracht apartment. I can offer you a viewing this Saturday at 11:00 or Sunday at 14:00.\\n\\nThe property features: 2 bedrooms, 85m², €2,500/month.\\n\\nPlease confirm your preferred time.\\n\\nBest regards,\\nReal Estate Team",
            mortgage: "Dear customer,\\n\\nFor first-time buyers, we offer several mortgage options:\\n- NHG mortgages up to €355,000\\n- Interest rates from 3.8%\\n- Free consultation with our advisors\\n\\nWould you like to schedule a free consultation this week?\\n\\nBest regards,\\nMortgage Advisory Team",
            rental: "Dear customer,\\n\\nThank you for your rental application. To proceed, please provide:\\n1. Proof of income (3 recent payslips)\\n2. Copy of ID\\n3. Employer statement\\n\\nThe studio is still available. Monthly rent: €1,450 incl. utilities.\\n\\nBest regards,\\nRental Department"
        }
    };
    
    // Determine response type based on keywords
    const lowerMessage = originalMessage.toLowerCase();
    let responseType = 'general';
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
        responseType = 'appointment';
    } else if (lowerMessage.includes('pain') || lowerMessage.includes('emergency')) {
        responseType = 'pain';
    } else if (lowerMessage.includes('insurance') || lowerMessage.includes('cover')) {
        responseType = 'insurance';
    } else if (lowerMessage.includes('order') || lowerMessage.includes('status')) {
        responseType = 'order';
    } else if (lowerMessage.includes('return') || lowerMessage.includes('small') || lowerMessage.includes('size')) {
        responseType = 'return';
    } else if (lowerMessage.includes('stock') || lowerMessage.includes('available')) {
        responseType = 'availability';
    } else if (lowerMessage.includes('viewing') || lowerMessage.includes('see')) {
        responseType = 'viewing';
    } else if (lowerMessage.includes('mortgage')) {
        responseType = 'mortgage';
    } else if (lowerMessage.includes('rental') || lowerMessage.includes('apply')) {
        responseType = 'rental';
    }
    
    const industryResponses = responses[industry] || responses.healthcare;
    return industryResponses[responseType] || industryResponses[Object.keys(industryResponses)[0]];
}

function renderEmailList(filter = 'all') {
    const container = document.getElementById('emailList');
    container.innerHTML = '';
    
    let filteredEmails = emailList;
    if (filter === 'new') {
        filteredEmails = emailList.filter(e => !e.replied);
    } else if (filter === 'replied') {
        filteredEmails = emailList.filter(e => e.replied);
    }
    
    filteredEmails.forEach(email => {
        const emailItem = document.createElement('div');
        emailItem.className = `email-item ${email.replied ? 'replied' : ''} ${selectedEmail?.id === email.id ? 'active' : ''}`;
        emailItem.innerHTML = `
            <div class="email-header">
                <span class="email-from">${email.from}</span>
                <span class="email-time">${formatTime(email.timestamp)}</span>
            </div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-preview">${email.message}</div>
            <div class="email-meta">
                <span class="email-industry">${allIndustries[email.industry]?.name || email.industry}</span>
                ${email.replied ? '<span class="email-status">✓ AI Replied</span>' : ''}
            </div>
        `;
        
        emailItem.addEventListener('click', () => selectEmail(email));
        container.appendChild(emailItem);
    });
}

async function selectEmail(email) {
    selectedEmail = email;
    renderEmailList(document.querySelector('#emailView .filter-btn.active').getAttribute('data-filter'));
    
    const detailContainer = document.getElementById('emailDetail');
    
    if (!email.replied) {
        // Show AI processing
        detailContainer.innerHTML = '<div class="loading">🤖 AI is processing email with OpenAI...</div>';
        
        try {
            const startTime = Date.now();
            
            // Call the backend API for real OpenAI response
            const response = await fetch('/api/email-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: email.message,
                    subject: email.subject,
                    from: email.from,
                    industry: email.industry,
                    language: detectLanguage(email.message)
                })
            });
            
            const data = await response.json();
            
            email.replied = true;
            email.aiResponse = data.response;
            email.responseTime = Math.round((Date.now() - startTime) / 1000);
            
            renderEmailDetail(email);
            updateEmailStats();
            renderEmailList(document.querySelector('#emailView .filter-btn.active').getAttribute('data-filter'));
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            // Fallback to generated response
            email.replied = true;
            email.aiResponse = generateAIEmailResponse(email.message, email.industry);
            email.responseTime = 2;
            renderEmailDetail(email);
            updateEmailStats();
            renderEmailList(document.querySelector('#emailView .filter-btn.active').getAttribute('data-filter'));
        }
    } else {
        renderEmailDetail(email);
    }
}

function renderEmailDetail(email) {
    const detailContainer = document.getElementById('emailDetail');
    
    detailContainer.innerHTML = `
        <div class="email-detail-header">
            <div class="email-detail-from">${email.from}</div>
            <div class="email-detail-subject">${email.subject}</div>
            <div class="email-detail-time">${formatTime(email.timestamp)} • ${allIndustries[email.industry]?.name || email.industry}</div>
        </div>
        
        <div class="email-content">
            <div class="email-original">
                <h5>Original Email:</h5>
                <p>${email.message}</p>
            </div>
            
            ${email.replied ? `
                <div class="ai-response">
                    <div class="ai-response-header">
                        <span class="ai-response-icon">🤖</span>
                        <span>AI Response</span>
                        <span class="response-time">Responded in ${email.responseTime}s</span>
                    </div>
                    <div class="ai-response-content">${email.aiResponse}</div>
                </div>
                
                ${email.replies && email.replies.length > 0 ? `
                    <div class="email-replies">
                        ${email.replies.map(reply => `
                            <div class="${reply.type === 'customer' ? 'customer-reply' : 'ai-response'}">
                                <div class="${reply.type === 'customer' ? 'reply-header' : 'ai-response-header'}">
                                    <span class="${reply.type === 'customer' ? 'reply-icon' : 'ai-response-icon'}">${reply.type === 'customer' ? '👤' : '🤖'}</span>
                                    <span>${reply.type === 'customer' ? 'Customer Reply' : 'AI Response'}</span>
                                    ${reply.responseTime ? `<span class="response-time">Responded in ${reply.responseTime}s</span>` : ''}
                                </div>
                                <div class="${reply.type === 'customer' ? 'reply-content' : 'ai-response-content'}">${reply.message}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="reply-section">
                    <h5 data-i18n="email.reply.title">Reply to this email:</h5>
                    <form id="emailReplyForm" class="email-reply-form">
                        <textarea id="replyMessage" rows="3" placeholder="Type your reply..." required></textarea>
                        <button type="submit" class="btn btn-primary btn-sm" data-i18n="email.reply.send">Send Reply</button>
                    </form>
                </div>
            ` : ''}
        </div>
    `;
    
    // Setup reply form if email has been replied
    if (email.replied) {
        const replyForm = document.getElementById('emailReplyForm');
        if (replyForm) {
            replyForm.addEventListener('submit', (e) => handleEmailReply(e, email));
        }
    }
}

async function handleEmailReply(e, originalEmail) {
    e.preventDefault();
    
    const replyMessage = document.getElementById('replyMessage').value;
    const replyForm = e.target;
    const submitButton = replyForm.querySelector('button[type="submit"]');
    
    // Disable form while processing
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading">Sending...</span>';
    
    try {
        const startTime = Date.now();
        
        // Create context with full conversation
        const conversationContext = `
Previous conversation:
Customer (${originalEmail.from}): ${originalEmail.message}
AI Response: ${originalEmail.aiResponse}
Customer Reply: ${replyMessage}

Generate a follow-up response that:
1. Acknowledges their reply appropriately
2. If they're confirming/ending the conversation (e.g., "ok", "thanks", "ill be there"), provide a brief acknowledgment without asking follow-up questions
3. Only continue the conversation if they have new questions or concerns
4. Maintains consistency with the previous response
5. Sign off as the company team, not with placeholder names
`;
        
        // Call the backend API for follow-up response
        const response = await fetch('/api/email-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: conversationContext,
                subject: originalEmail.subject,
                from: originalEmail.from,
                industry: originalEmail.industry,
                language: detectLanguage(replyMessage)
            })
        });
        
        const data = await response.json();
        
        // Add the new reply to the email conversation
        if (!originalEmail.replies) {
            originalEmail.replies = [];
        }
        
        originalEmail.replies.push({
            type: 'customer',
            message: replyMessage,
            timestamp: new Date()
        });
        
        originalEmail.replies.push({
            type: 'ai',
            message: data.response,
            timestamp: new Date(),
            responseTime: Math.round((Date.now() - startTime) / 1000)
        });
        
        // Re-render the email detail
        renderEmailDetail(originalEmail);
        
    } catch (error) {
        console.error('Error sending reply:', error);
        alert('Failed to send reply. Please try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Reply';
    }
}

function filterEmails(filter) {
    renderEmailList(filter);
}

function updateEmailStats() {
    const totalEmails = emailList.length;
    const repliedEmails = emailList.filter(e => e.replied).length;
    const avgResponseTime = emailList
        .filter(e => e.replied && e.responseTime)
        .reduce((acc, e, i, arr) => acc + e.responseTime / arr.length, 0);
    
    document.getElementById('totalEmails').textContent = totalEmails;
    document.getElementById('repliedEmails').textContent = repliedEmails;
    document.getElementById('avgEmailTime').textContent = Math.round(avgResponseTime) + 's';
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) { // Less than 1 hour
        return Math.floor(diff / 60000) + 'm ago';
    } else if (diff < 86400000) { // Less than 24 hours
        return Math.floor(diff / 3600000) + 'h ago';
    } else {
        return date.toLocaleDateString();
    }
}