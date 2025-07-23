// Language translations
const translations = {
    en: {
        'nav.features': 'Features',
        'nav.industries': 'Industries',
        'nav.demo': 'Demo',
        'hero.title.line1': 'Experience the Future of',
        'hero.title.line2': 'Multilingual AI Customer Service',
        'hero.subtitle': 'See how AI transforms customer support with intelligent, context-aware responses in multiple languages. Real-time analytics, seamless handoffs, and 24/7 availability.',
        'hero.email': 'NEW: AI Email Automation - Connect directly to your email server and let AI handle customer emails 24/7!',
        'hero.cta.primary': 'Choose Your Industry',
        'hero.cta.secondary': 'Learn More',
        'hero.stats.accuracy': 'Accuracy',
        'hero.stats.response': 'Response Time',
        'hero.stats.availability': 'Availability',
        'hero.chat.title': 'AI Assistant Online',
        'hero.chat.customer': 'How can I track my order?',
        'features.title': 'Powerful Features for Every Business',
        'features.subtitle': 'Everything you need to deliver exceptional customer service',
        'features.multilingual.title': 'Multilingual Support',
        'features.multilingual.description': 'Seamless conversations in English and Dutch with automatic language detection',
        'features.ai.title': 'GPT-4 Powered',
        'features.ai.description': 'Context-aware responses that understand your business and customers',
        'features.analytics.title': 'Real-time Analytics',
        'features.analytics.description': 'Track performance, satisfaction, and language usage in real-time',
        'features.handoff.title': 'Smart Handoffs',
        'features.handoff.description': 'Seamless transfer to human agents when needed with full context',
        'features.instant.title': 'Instant Responses',
        'features.instant.description': 'No waiting times - immediate, accurate answers 24/7',
        'features.custom.title': 'Industry Specific',
        'features.custom.description': 'Tailored responses for your specific industry and use cases',
        'industries.title': 'Choose Your Industry Demo',
        'industries.subtitle': 'Experience AI customer service tailored to your specific industry needs',
        'how.title': 'See It In Action',
        'how.subtitle': 'Three perspectives showing the complete customer service experience',
        'how.customer.title': 'Customer View',
        'how.customer.description': 'Chat with AI in your preferred language. Get instant, accurate answers to your questions.',
        'how.customer.feature1': 'Auto-language detection',
        'how.customer.feature2': 'Quick suggestions',
        'how.customer.feature3': 'Real-time responses',
        'how.agent.title': 'Agent Dashboard',
        'how.agent.description': 'Monitor live conversations, get AI suggestions, and handle escalations efficiently.',
        'how.agent.feature1': 'Live ticket management',
        'how.agent.feature2': 'AI-powered suggestions',
        'how.agent.feature3': 'Language indicators',
        'how.manager.title': 'Manager Analytics',
        'how.manager.description': 'Track KPIs, language distribution, and team performance with real-time dashboards.',
        'how.manager.feature1': 'Performance metrics',
        'how.manager.feature2': 'Language analytics',
        'how.manager.feature3': 'Trend analysis',
        'cta.title': 'Ready to Transform Your Customer Service?',
        'cta.subtitle': 'Choose an industry above to see the AI in action',
        'cta.button': 'Start Demo Now',
        'footer.text': '© 2024 Upsell Business Agency. AI-powered customer service solutions.',
        'footer.note': 'This is a demo platform showcasing AI capabilities in customer service.'
    },
    nl: {
        'nav.features': 'Functies',
        'nav.industries': 'Sectoren',
        'nav.demo': 'Demo',
        'hero.title.line1': 'Ervaar de Toekomst van',
        'hero.title.line2': 'Meertalige AI Klantenservice',
        'hero.subtitle': 'Zie hoe AI klantenondersteuning transformeert met intelligente, contextbewuste antwoorden in meerdere talen. Real-time analytics, naadloze overdrachten en 24/7 beschikbaarheid.',
        'hero.email': 'NIEUW: AI Email Automatisering - Koppel direct aan uw email server en laat AI klant emails 24/7 afhandelen!',
        'hero.cta.primary': 'Kies Uw Sector',
        'hero.cta.secondary': 'Meer Informatie',
        'hero.stats.accuracy': 'Nauwkeurigheid',
        'hero.stats.response': 'Reactietijd',
        'hero.stats.availability': 'Beschikbaarheid',
        'hero.chat.title': 'AI Assistent Online',
        'hero.chat.customer': 'Hoe kan ik mijn bestelling volgen?',
        'features.title': 'Krachtige Functies voor Elk Bedrijf',
        'features.subtitle': 'Alles wat u nodig heeft voor uitzonderlijke klantenservice',
        'features.multilingual.title': 'Meertalige Ondersteuning',
        'features.multilingual.description': 'Naadloze gesprekken in Engels en Nederlands met automatische taaldetectie',
        'features.ai.title': 'GPT-4 Aangedreven',
        'features.ai.description': 'Contextbewuste antwoorden die uw bedrijf en klanten begrijpen',
        'features.analytics.title': 'Real-time Analytics',
        'features.analytics.description': 'Volg prestaties, tevredenheid en taalgebruik in real-time',
        'features.handoff.title': 'Slimme Overdrachten',
        'features.handoff.description': 'Naadloze overdracht naar menselijke agents wanneer nodig met volledige context',
        'features.instant.title': 'Directe Antwoorden',
        'features.instant.description': 'Geen wachttijden - onmiddellijke, accurate antwoorden 24/7',
        'features.custom.title': 'Sector Specifiek',
        'features.custom.description': 'Op maat gemaakte antwoorden voor uw specifieke sector en use cases',
        'industries.title': 'Kies Uw Sector Demo',
        'industries.subtitle': 'Ervaar AI klantenservice afgestemd op uw specifieke sectorbehoeften',
        'how.title': 'Zie Het In Actie',
        'how.subtitle': 'Drie perspectieven die de complete klantenservice ervaring tonen',
        'how.customer.title': 'Klant Weergave',
        'how.customer.description': 'Chat met AI in uw voorkeurstaal. Krijg direct accurate antwoorden op uw vragen.',
        'how.customer.feature1': 'Automatische taaldetectie',
        'how.customer.feature2': 'Snelle suggesties',
        'how.customer.feature3': 'Real-time antwoorden',
        'how.agent.title': 'Agent Dashboard',
        'how.agent.description': 'Monitor live gesprekken, krijg AI suggesties en handel escalaties efficiënt af.',
        'how.agent.feature1': 'Live ticket beheer',
        'how.agent.feature2': 'AI-aangedreven suggesties',
        'how.agent.feature3': 'Taal indicatoren',
        'how.manager.title': 'Manager Analytics',
        'how.manager.description': 'Volg KPIs, taalverdeling en teamprestaties met real-time dashboards.',
        'how.manager.feature1': 'Prestatie metrics',
        'how.manager.feature2': 'Taal analytics',
        'how.manager.feature3': 'Trend analyse',
        'cta.title': 'Klaar om Uw Klantenservice te Transformeren?',
        'cta.subtitle': 'Kies hierboven een sector om de AI in actie te zien',
        'cta.button': 'Start Demo Nu',
        'footer.text': '© 2024 Upsell Business Agency. AI-aangedreven klantenservice oplossingen.',
        'footer.note': 'Dit is een demo platform dat AI mogelijkheden in klantenservice toont.'
    }
};

// Current language
let currentLang = localStorage.getItem('preferredLang') || detectBrowserLanguage();

// Detect browser language
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('nl') ? 'nl' : 'en';
}

// Update page language
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    
    // Update all translated elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    // Reload industries with new language
    loadIndustries();
}

// Load industries from API
async function loadIndustries() {
    try {
        const response = await fetch(`/api/industries?lang=${currentLang}`);
        const industries = await response.json();
        
        const grid = document.getElementById('industriesGrid');
        grid.innerHTML = '';
        
        Object.entries(industries).forEach(([key, industry]) => {
            const card = document.createElement('a');
            card.href = `/ai-customer-service-demo/demo/${key}?lang=${currentLang}`;
            card.className = 'industry-card';
            card.innerHTML = `
                <div class="industry-icon">${industry.icon}</div>
                <h3 class="industry-name">${industry.name}</h3>
                <p class="industry-description">${industry.description}</p>
            `;
            card.style.borderColor = industry.colors.primary + '20';
            
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = industry.colors.primary;
                card.style.boxShadow = `0 20px 40px ${industry.colors.primary}20`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = industry.colors.primary + '20';
                card.style.boxShadow = '';
            });
            
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading industries:', error);
    }
}

// Chat preview animation
function animateChatPreview() {
    const typingMessage = document.querySelector('.message.typing');
    const aiResponse = currentLang === 'en' 
        ? "I'd be happy to help you track your order! Please provide your order number and I'll check the status for you right away."
        : "Ik help u graag uw bestelling te volgen! Geef uw bestelnummer door en ik controleer direct de status voor u.";
    
    setTimeout(() => {
        typingMessage.classList.remove('typing');
        typingMessage.innerHTML = `<span>${aiResponse}</span>`;
    }, 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    updateLanguage(currentLang);
    
    // Language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            updateLanguage(lang);
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animate chat preview
    animateChatPreview();
    
    // Restart chat animation every 10 seconds
    setInterval(() => {
        const typingMessage = document.querySelector('.message.ai');
        typingMessage.classList.add('typing');
        typingMessage.innerHTML = `
            <span class="typing-indicator">
                <span></span><span></span><span></span>
            </span>
        `;
        animateChatPreview();
    }, 10000);
    
    // Animate counter numbers
    const counters = document.querySelectorAll('.counter');
    const animateCounters = () => {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    };
    
    // Start counter animation when visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        heroObserver.observe(heroStats);
    }
    
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Observe feature cards and role cards
    document.querySelectorAll('.feature-card, .role-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});