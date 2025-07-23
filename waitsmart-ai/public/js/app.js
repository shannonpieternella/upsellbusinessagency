// WaitSmart AI - Main Application JavaScript
'use strict';

// DOM Elements
const demoNavItems = document.querySelectorAll('.demo-nav-item');
const demoViews = document.querySelectorAll('.demo-view');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeDemoNav();
    initializeCharts();
    initializeROICalculator();
    initializeAnimations();
    initializeModal();
    
    // Initialize translations if available
    if (window.setLanguage) {
        const savedLang = localStorage.getItem('preferredLanguage') || 'nl';
        window.setLanguage(savedLang);
    }
    
    // Add event listeners to language switcher buttons
    const langButtons = document.querySelectorAll('.lang-option');
    console.log('WaitSmart AI - Found language buttons:', langButtons.length);
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            console.log('WaitSmart AI - Language switch clicked:', lang);
            
            if (typeof setLanguage === 'function') {
                setLanguage(lang);
            } else {
                console.error('setLanguage function not found');
            }
        });
    });
});

// Demo Navigation
function initializeDemoNav() {
    demoNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            
            // Update active states
            demoNavItems.forEach(nav => nav.classList.remove('active'));
            demoViews.forEach(view => view.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(targetView + 'View')?.classList.add('active');
            
            // Reinitialize charts if analytics view
            if (targetView === 'analytics') {
                setTimeout(() => initializeAnalyticsCharts(), 100);
            }
        });
    });
}

// Chart Initialization
let charts = {};
window.charts = charts; // Make charts globally accessible for translations

function initializeCharts() {
    // Trend Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Totaal Wachtenden',
                    data: [3420, 3380, 3210, 3050, 2920, 2847],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Urgente Cases',
                    data: [210, 195, 178, 165, 155, 142],
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    }

    // Capacity Chart
    const capacityCtx = document.getElementById('capacityChart');
    if (capacityCtx) {
        charts.capacity = new Chart(capacityCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Beschikbare Capaciteit',
                    data: [120, 115, 130, 125],
                    backgroundColor: '#059669'
                }, {
                    label: 'Benodigde Capaciteit',
                    data: [140, 135, 128, 132],
                    backgroundColor: '#d97706'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    }
}

function initializeAnalyticsCharts() {
    // Forecast Chart
    const forecastCtx = document.getElementById('forecastChart');
    if (forecastCtx && !charts.forecast) {
        charts.forecast = new Chart(forecastCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun'],
                datasets: [{
                    label: 'Voorspelde Wachtlijst',
                    data: [2847, 2980, 3150, 3320, 3280, 3200],
                    borderColor: '#d97706',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Met Interventie',
                    data: [2847, 2750, 2650, 2500, 2400, 2300],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    }
}

// ROI Calculator
function initializeROICalculator() {
    const inputs = {
        patientCount: document.getElementById('patientCount'),
        waitTime: document.getElementById('waitTime'),
        fteCount: document.getElementById('fteCount'),
        noShowRate: document.getElementById('noShowRate')
    };
    
    const outputs = {
        patientCountValue: document.getElementById('patientCountValue'),
        waitTimeValue: document.getElementById('waitTimeValue'),
        fteCountValue: document.getElementById('fteCountValue'),
        noShowRateValue: document.getElementById('noShowRateValue'),
        totalSavings: document.getElementById('totalSavings'),
        adminSavings: document.getElementById('adminSavings'),
        noShowSavings: document.getElementById('noShowSavings'),
        capacitySavings: document.getElementById('capacitySavings')
    };
    
    function calculateROI() {
        const values = {
            patients: parseInt(inputs.patientCount.value),
            waitTime: parseInt(inputs.waitTime.value),
            fte: parseInt(inputs.fteCount.value),
            noShow: parseInt(inputs.noShowRate.value)
        };
        
        // Update display values
        outputs.patientCountValue.textContent = values.patients.toLocaleString();
        outputs.waitTimeValue.textContent = values.waitTime + ' dagen';
        outputs.fteCountValue.textContent = values.fte + ' FTE';
        outputs.noShowRateValue.textContent = values.noShow + '%';
        
        // Calculate savings (simplified formulas for demo)
        const avgSalary = 50000;
        const adminEfficiency = values.fte * avgSalary * 0.4; // 40% time savings
        const noShowReduction = values.patients * (values.noShow / 100) * 0.8 * 150; // €150 per no-show
        const capacityOptimization = values.patients * 0.15 * 200; // 15% better utilization
        
        const total = adminEfficiency + noShowReduction + capacityOptimization;
        
        // Update results
        outputs.totalSavings.textContent = '€' + Math.round(total).toLocaleString();
        outputs.adminSavings.textContent = '€' + Math.round(adminEfficiency).toLocaleString();
        outputs.noShowSavings.textContent = '€' + Math.round(noShowReduction).toLocaleString();
        outputs.capacitySavings.textContent = '€' + Math.round(capacityOptimization).toLocaleString();
    }
    
    // Add event listeners
    Object.values(inputs).forEach(input => {
        if (input) {
            input.addEventListener('input', calculateROI);
        }
    });
    
    // Initial calculation
    calculateROI();
}

// Animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.stat-card, .problem-card, .feature-block, .success-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Modal Functions
function initializeModal() {
    const modal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    
    // Handle form submission
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulate login (in real app, this would validate credentials)
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (email && password) {
            alert('Login simulatie succesvol! In een echte applicatie zou u nu naar het dashboard gaan.');
            closeLogin();
        }
    });
}

// Global Functions
window.scrollToDemo = function() {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
};

window.showROI = function() {
    document.getElementById('roi')?.scrollIntoView({ behavior: 'smooth' });
};

window.showLogin = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeLogin = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Simulate real-time updates
function simulateRealTimeUpdates() {
    // Update urgent cases randomly
    setInterval(() => {
        const urgentValue = document.querySelector('.metric-card.urgent .metric-value');
        if (urgentValue) {
            const current = parseInt(urgentValue.textContent);
            const change = Math.random() > 0.5 ? 1 : -1;
            const newValue = Math.max(130, Math.min(150, current + change));
            urgentValue.textContent = newValue;
        }
    }, 5000);
}

// Initialize real-time updates
simulateRealTimeUpdates();

// Patient Priority Score Animation
function animatePriorityScores() {
    const scoreCircles = document.querySelectorAll('.score-circle');
    scoreCircles.forEach(circle => {
        const score = parseInt(circle.querySelector('.score, .score-value')?.textContent || 0);
        let currentScore = 0;
        
        const interval = setInterval(() => {
            if (currentScore < score) {
                currentScore += 1;
                circle.querySelector('.score, .score-value').textContent = currentScore;
            } else {
                clearInterval(interval);
            }
        }, 20);
    });
}

// Initialize priority score animation when prioritization view is shown
document.querySelector('[data-view="prioritization"]')?.addEventListener('click', () => {
    setTimeout(animatePriorityScores, 300);
});

// Hospital Marker Tooltips
document.querySelectorAll('.hospital-marker').forEach(marker => {
    marker.addEventListener('click', function() {
        const name = this.getAttribute('data-name');
        const capacity = this.getAttribute('data-capacity');
        const wait = this.getAttribute('data-wait');
        
        alert(`${name}\nCapaciteit: ${capacity}\nGem. Wachttijd: ${wait}`);
    });
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Export functions for use in other modules
window.WaitSmartAI = {
    charts,
    calculateROI: initializeROICalculator,
    showLogin,
    closeLogin
};