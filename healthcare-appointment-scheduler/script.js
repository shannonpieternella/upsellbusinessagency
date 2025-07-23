// Premium Healthcare Appointment Scheduler - Script
'use strict';

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

themeToggle?.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
if (themeToggle) {
    themeToggle.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Counter Animation
const counters = document.querySelectorAll('.counter');
const animateCounters = () => {
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 50;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('counter')) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

counters.forEach(counter => observer.observe(counter));

// Smooth Scrolling
function scrollToDemo() {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
}

// Demo Tab Switching
const demoTabs = document.querySelectorAll('.demo-tab');
const demoViews = document.querySelectorAll('.demo-view');

demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-view');
        
        // Update active states
        demoTabs.forEach(t => t.classList.remove('active'));
        demoViews.forEach(v => v.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(targetView + 'View')?.classList.add('active');
    });
});

// Appointment Booking Flow
const steps = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('.step-content');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentStep = 1;

// Selected appointment data
const appointmentData = {
    service: null,
    date: null,
    time: null
};

// Service Selection
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        serviceCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        appointmentData.service = card.getAttribute('data-service');
        
        // Update summary
        const serviceLabels = {
            'consultation': 'General Consultation',
            'checkup': 'Annual Check-up',
            'specialist': 'Specialist Referral',
            'followup': 'Follow-up Visit'
        };
        document.getElementById('summaryService').textContent = serviceLabels[appointmentData.service];
    });
});

// Calendar Generation
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Clear existing calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header-day';
        header.textContent = day;
        header.style.fontWeight = '600';
        header.style.fontSize = '0.875rem';
        header.style.color = 'var(--text-secondary)';
        calendarGrid.appendChild(header);
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Make some days available (simulating real availability)
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        
        // Make weekdays available, except past dates
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && date >= today) {
            dayElement.classList.add('available');
            
            dayElement.addEventListener('click', () => {
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                dayElement.classList.add('selected');
                appointmentData.date = date;
                
                // Update selected date display
                const options = { month: 'long', day: 'numeric' };
                document.getElementById('selectedDate').textContent = date.toLocaleDateString('en-US', options);
                
                // Update summary
                document.getElementById('summaryDate').textContent = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            });
        }
    }
}

// Time Slot Selection
const timeSlots = document.querySelectorAll('.time-slot.available');
timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
        timeSlots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        appointmentData.time = slot.textContent;
        
        // Update summary
        document.getElementById('summaryTime').textContent = slot.textContent;
    });
});

// Step Navigation
function updateStep(step) {
    // Update step indicators
    steps.forEach((s, index) => {
        if (index < step - 1) {
            s.classList.add('completed');
            s.classList.remove('active');
        } else if (index === step - 1) {
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });
    
    // Update content
    stepContents.forEach((content, index) => {
        content.classList.toggle('active', index === step - 1);
    });
    
    // Update navigation buttons
    prevBtn.style.display = step === 1 ? 'none' : 'block';
    
    if (step === 3) {
        nextBtn.textContent = 'Book Appointment';
        nextBtn.onclick = () => {
            // In a real app, this would submit to a server
            alert('Appointment booked successfully! A confirmation email has been sent.');
        };
    } else {
        nextBtn.textContent = 'Continue';
        nextBtn.onclick = () => goToStep(currentStep + 1);
    }
}

function goToStep(step) {
    if (step < 1 || step > 3) return;
    
    // Validation
    if (currentStep === 1 && !appointmentData.service) {
        alert('Please select a service');
        return;
    }
    if (currentStep === 2 && (!appointmentData.date || !appointmentData.time)) {
        alert('Please select both date and time');
        return;
    }
    
    currentStep = step;
    updateStep(currentStep);
}

// Initialize step navigation
prevBtn?.addEventListener('click', () => goToStep(currentStep - 1));
nextBtn?.addEventListener('click', () => goToStep(currentStep + 1));

// Initialize calendar
generateCalendar();

// ROI Calculator
const noShowSlider = document.getElementById('noShowRate');
const appointmentValueSlider = document.getElementById('appointmentValue');
const monthlyAppointmentsSlider = document.getElementById('monthlyAppointments');

function updateROI() {
    if (!noShowSlider || !appointmentValueSlider || !monthlyAppointmentsSlider) return;
    
    const noShowRate = parseFloat(noShowSlider.value);
    const appointmentValue = parseFloat(appointmentValueSlider.value);
    const monthlyAppointments = parseFloat(monthlyAppointmentsSlider.value);
    
    // Update display values
    document.getElementById('noShowValue').textContent = noShowRate + '%';
    document.getElementById('appointmentValueDisplay').textContent = '€' + appointmentValue;
    document.getElementById('appointmentsValue').textContent = monthlyAppointments;
    
    // Calculate losses and savings
    const currentMonthlyLoss = (noShowRate / 100) * monthlyAppointments * appointmentValue;
    const reducedNoShowRate = noShowRate * 0.2; // 80% reduction
    const newMonthlyLoss = (reducedNoShowRate / 100) * monthlyAppointments * appointmentValue;
    const monthlySavings = currentMonthlyLoss - newMonthlyLoss;
    const annualROI = monthlySavings * 12;
    
    // Update results
    document.getElementById('currentLoss').textContent = '€' + Math.round(currentMonthlyLoss).toLocaleString();
    document.getElementById('monthlySavings').textContent = '€' + Math.round(monthlySavings).toLocaleString();
    document.getElementById('annualROI').textContent = '€' + Math.round(annualROI).toLocaleString();
}

// ROI Calculator Event Listeners
noShowSlider?.addEventListener('input', updateROI);
appointmentValueSlider?.addEventListener('input', updateROI);
monthlyAppointmentsSlider?.addEventListener('input', updateROI);

// Initialize ROI calculation
updateROI();

// Mobile Menu Toggle (if needed)
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav');

hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu?.classList.toggle('active');
});

// Add smooth scrolling for all anchor links
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

// Initialize first step
updateStep(1);

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        if (!this.classList.contains('loading')) {
            // Add loading class temporarily
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 1000);
        }
    });
});