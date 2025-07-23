// Navigation Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth Scrolling
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

// Navbar Background on Scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.8)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Typing Animation for Code
const codeLines = window.innerWidth < 768 ? [
    `<span class="keyword">const</span> <span class="variable">ai</span> = <span class="keyword">new</span> <span class="class">AI</span>({`,
    `  <span class="property">lang</span>: <span class="string">'en'</span>,`,
    `  <span class="property">speed</span>: <span class="string">'< 1s'</span>`,
    `});`,
    ``,
    `<span class="variable">ai</span>.<span class="method">automate</span>({`,
    `  <span class="property">tasks</span>: [<span class="string">'all'</span>],`,
    `  <span class="property">24/7</span>: <span class="string">true</span>`,
    `});`
] : [
    `<span class="keyword">const</span> <span class="variable">aiAgent</span> = <span class="keyword">new</span> <span class="class">CustomerServiceAI</span>({`,
    `  <span class="property">language</span>: <span class="string">'en'</span>,`,
    `  <span class="property">responseTime</span>: <span class="string">'< 1s'</span>,`,
    `  <span class="property">accuracy</span>: <span class="string">'99.9%'</span>`,
    `});`,
    ``,
    `<span class="variable">aiAgent</span>.<span class="method">automate</span>({`,
    `  <span class="property">tasks</span>: [<span class="string">'support'</span>, <span class="string">'sales'</span>, <span class="string">'onboarding'</span>],`,
    `  <span class="property">availability</span>: <span class="string">'24/7'</span>,`,
    `  <span class="property">scalability</span>: <span class="string">'unlimited'</span>`,
    `});`
];

let currentLine = 0;
let currentChar = 0;
let isDeleting = false;
let isPaused = false;

function typeCode() {
    const codeContent = document.querySelector('.code-content code');
    if (!codeContent) return;
    
    const fullText = codeLines.join('\n');
    
    if (!isDeleting && currentChar < fullText.length) {
        codeContent.innerHTML = fullText.substring(0, currentChar + 1) + '<span class="cursor">|</span>';
        currentChar++;
        setTimeout(typeCode, 50);
    } else if (isDeleting && currentChar > 0) {
        codeContent.innerHTML = fullText.substring(0, currentChar - 1) + '<span class="cursor">|</span>';
        currentChar--;
        setTimeout(typeCode, 30);
    } else if (!isDeleting && currentChar === fullText.length) {
        isPaused = true;
        setTimeout(() => {
            isPaused = false;
            isDeleting = true;
            typeCode();
        }, 3000);
    } else if (isDeleting && currentChar === 0) {
        isDeleting = false;
        setTimeout(typeCode, 500);
    }
}

// Start typing animation when page loads
window.addEventListener('load', () => {
    setTimeout(typeCode, 1000);
});

// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate stat numbers
            if (entry.target.classList.contains('stat')) {
                animateStatNumber(entry.target);
            }
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.service-card, .project-card, .stat, .benefit').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add visible class styles
const style = document.createElement('style');
style.textContent = `
    .visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .cursor {
        animation: blink 1s infinite;
    }
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Animate stat numbers
function animateStatNumber(statElement) {
    const numberElement = statElement.querySelector('.stat-number');
    if (!numberElement) return;
    
    const text = numberElement.textContent;
    const isPercentage = text.includes('%');
    const hasPlus = text.includes('+');
    const number = parseInt(text.replace(/[^0-9]/g, ''));
    
    let current = 0;
    const increment = number / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        
        let displayText = Math.floor(current).toString();
        if (hasPlus) displayText += '+';
        if (isPercentage) displayText += '%';
        
        numberElement.textContent = displayText;
    }, 30);
}

// Form Handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Get UI elements
        const submitButton = contactForm.querySelector('.submit-button');
        const formMessage = document.getElementById('formMessage');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Versturen...</span>';
        
        try {
            // Send to server
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    company: data.company || '',
                    projectType: data['project-type'],
                    message: data.message
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                submitButton.innerHTML = '<span>✓ Bericht Verzonden!</span>';
                submitButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                if (formMessage) {
                    formMessage.style.display = 'block';
                    formMessage.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))';
                    formMessage.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                    formMessage.style.color = '#10b981';
                    formMessage.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">✓</span>
                            <span>${window.currentLang === 'nl' ? 'Bedankt voor uw bericht! We nemen binnen 24 uur contact met u op.' : result.message}</span>
                        </div>
                    `;
                }
                
                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.innerHTML = originalText;
                    submitButton.style.background = '';
                    submitButton.disabled = false;
                    if (formMessage) {
                        formMessage.style.display = 'none';
                    }
                }, 5000);
            } else {
                throw new Error(result.message || 'Er ging iets mis');
            }
        } catch (error) {
            // Show error message
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            if (formMessage) {
                formMessage.style.display = 'block';
                formMessage.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))';
                formMessage.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                formMessage.style.color = '#ef4444';
                formMessage.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">⚠️</span>
                        <span>${error.message || 'Er ging iets mis. Probeer het later opnieuw.'}</span>
                    </div>
                `;
            }
            
            console.error('Form submission error:', error);
        }
    });
}

// Parallax Effect for Gradient Spheres
window.addEventListener('mousemove', (e) => {
    const spheres = document.querySelectorAll('.gradient-sphere');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    spheres.forEach((sphere, index) => {
        const speed = (index + 1) * 0.5;
        const xOffset = (x - 0.5) * speed * 50;
        const yOffset = (y - 0.5) * speed * 50;
        
        sphere.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});

// Project Card Hover Effect
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Add gradient hover effect styles
const hoverStyle = document.createElement('style');
hoverStyle.textContent = `
    .project-card::before {
        content: '';
        position: absolute;
        top: var(--mouse-y, 50%);
        left: var(--mouse-x, 50%);
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1;
    }
    .project-card:hover::before {
        opacity: 1;
    }
`;
document.head.appendChild(hoverStyle);

// Loading Animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Language Switcher - Add event listeners after page load
document.addEventListener('DOMContentLoaded', () => {
    // Re-attach event listeners to language buttons
    const langButtons = document.querySelectorAll('.lang-option');
    console.log('Found language buttons:', langButtons.length);
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            console.log('Language switch clicked in script.js:', lang);
            
            if (typeof setLanguage === 'function') {
                setLanguage(lang);
            } else {
                console.error('setLanguage function not found');
            }
        });
    });
});

// Add loaded styles
const loadedStyle = document.createElement('style');
loadedStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadedStyle);