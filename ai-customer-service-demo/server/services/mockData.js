const industries = require('../config/industries');

// Generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate random timestamp within last 24 hours
function generateRecentTimestamp() {
  const now = Date.now();
  const yesterday = now - (24 * 60 * 60 * 1000);
  return new Date(yesterday + Math.random() * (now - yesterday));
}

// Generate initial tickets for an industry
function generateInitialTickets(industry, lang) {
  const industryConfig = industries.data[industry];
  if (!industryConfig) return [];
  
  const ticketTemplates = industryConfig.mockTickets[lang];
  const tickets = [];
  
  // Generate 5-8 tickets
  const ticketCount = 5 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < ticketCount; i++) {
    const template = ticketTemplates[i % ticketTemplates.length];
    const status = Math.random() > 0.7 ? 'resolved' : (Math.random() > 0.5 ? 'in-progress' : 'pending');
    
    tickets.push({
      id: generateId(),
      content: template,
      customerName: generateCustomerName(lang),
      language: lang,
      status: status,
      priority: assignPriority(template),
      createdAt: generateRecentTimestamp(),
      updatedAt: generateRecentTimestamp(),
      responseTime: status !== 'pending' ? Math.floor(Math.random() * 300) + 30 : null,
      satisfaction: status === 'resolved' ? Math.floor(Math.random() * 30) + 70 : null,
      agentId: status !== 'pending' ? `agent-${Math.floor(Math.random() * 5) + 1}` : null
    });
  }
  
  return tickets.sort((a, b) => b.createdAt - a.createdAt);
}

// Generate customer names
function generateCustomerName(lang) {
  const names = {
    en: [
      'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 
      'James Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martin',
      'David Lee', 'Maria Garcia', 'William Jones', 'Patricia Miller'
    ],
    nl: [
      'Jan de Vries', 'Emma Bakker', 'Pieter van Dijk', 'Sophie Janssen',
      'Lars van den Berg', 'Anna de Jong', 'Daan Vermeer', 'Lisa Smit',
      'Tom Mulder', 'Sara de Boer', 'Bas Visser', 'Julia van Leeuwen'
    ]
  };
  
  return names[lang][Math.floor(Math.random() * names[lang].length)];
}

// Assign priority based on keywords
function assignPriority(content) {
  const lowercaseContent = content.toLowerCase();
  
  if (lowercaseContent.includes('urgent') || lowercaseContent.includes('pain') || 
      lowercaseContent.includes('emergency') || lowercaseContent.includes('broken') ||
      lowercaseContent.includes('pijn') || lowercaseContent.includes('urgent') ||
      lowercaseContent.includes('kapot')) {
    return 'high';
  }
  
  if (lowercaseContent.includes('question') || lowercaseContent.includes('information') ||
      lowercaseContent.includes('vraag') || lowercaseContent.includes('informatie')) {
    return 'low';
  }
  
  return 'medium';
}

// Generate analytics data
function generateAnalytics(industry, lang) {
  const now = new Date();
  const labels = {
    en: {
      avgResponseTime: "Avg Response Time",
      satisfaction: "Customer Satisfaction",
      activeTickets: "Active Tickets",
      resolutionRate: "Resolution Rate",
      ticketsToday: "Tickets Today",
      avgHandleTime: "Avg Handle Time",
      languageDistribution: "Language Distribution",
      ticketsByHour: "Tickets by Hour",
      satisfactionByLanguage: "Satisfaction by Language",
      responseTimeByLanguage: "Response Time by Language"
    },
    nl: {
      avgResponseTime: "Gem. Response Tijd",
      satisfaction: "Klanttevredenheid",
      activeTickets: "Actieve Tickets",
      resolutionRate: "Oplossingspercentage",
      ticketsToday: "Tickets Vandaag",
      avgHandleTime: "Gem. Afhandeltijd",
      languageDistribution: "Taalverdeling",
      ticketsByHour: "Tickets per Uur",
      satisfactionByLanguage: "Tevredenheid per Taal",
      responseTimeByLanguage: "Response Tijd per Taal"
    }
  };
  
  // Generate hourly data for the last 24 hours
  const hourlyData = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
    hourlyData.push({
      hour: hour.getHours(),
      tickets: Math.floor(Math.random() * 15) + 5,
      avgResponseTime: Math.floor(Math.random() * 120) + 30
    });
  }
  
  // Language distribution
  const enPercentage = Math.floor(Math.random() * 30) + 35; // 35-65%
  const nlPercentage = 100 - enPercentage;
  
  return {
    kpis: {
      avgResponseTime: {
        label: labels[lang].avgResponseTime,
        value: Math.floor(Math.random() * 120) + 60, // 60-180 seconds
        unit: 's',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.floor(Math.random() * 20) - 10
      },
      satisfaction: {
        label: labels[lang].satisfaction,
        value: Math.floor(Math.random() * 15) + 85, // 85-100%
        unit: '%',
        trend: 'up',
        change: Math.floor(Math.random() * 5) + 1
      },
      activeTickets: {
        label: labels[lang].activeTickets,
        value: Math.floor(Math.random() * 30) + 10,
        unit: '',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.floor(Math.random() * 10) - 5
      },
      resolutionRate: {
        label: labels[lang].resolutionRate,
        value: Math.floor(Math.random() * 10) + 90, // 90-100%
        unit: '%',
        trend: 'up',
        change: Math.floor(Math.random() * 3) + 1
      }
    },
    
    charts: {
      ticketsByHour: {
        label: labels[lang].ticketsByHour,
        data: hourlyData
      },
      
      languageDistribution: {
        label: labels[lang].languageDistribution,
        data: [
          { language: 'English', percentage: enPercentage, count: Math.floor(Math.random() * 500) + 200 },
          { language: 'Nederlands', percentage: nlPercentage, count: Math.floor(Math.random() * 500) + 200 }
        ]
      },
      
      satisfactionByLanguage: {
        label: labels[lang].satisfactionByLanguage,
        data: [
          { language: 'English', satisfaction: Math.floor(Math.random() * 10) + 85 },
          { language: 'Nederlands', satisfaction: Math.floor(Math.random() * 10) + 87 }
        ]
      },
      
      responseTimeByLanguage: {
        label: labels[lang].responseTimeByLanguage,
        data: [
          { language: 'English', avgTime: Math.floor(Math.random() * 60) + 60 },
          { language: 'Nederlands', avgTime: Math.floor(Math.random() * 60) + 70 }
        ]
      }
    },
    
    recentActivity: generateRecentActivity(lang),
    
    agentPerformance: generateAgentPerformance(lang)
  };
}

// Generate recent activity feed
function generateRecentActivity(lang) {
  const activities = {
    en: [
      { type: 'ticket_resolved', message: 'Ticket #[ID] resolved by [AGENT]', icon: '✅' },
      { type: 'high_satisfaction', message: 'Customer rated 5 stars', icon: '⭐' },
      { type: 'new_ticket', message: 'New ticket from [CUSTOMER]', icon: '📩' },
      { type: 'escalation', message: 'Ticket escalated to specialist', icon: '🔴' },
      { type: 'ai_handled', message: 'AI successfully handled inquiry', icon: '🤖' }
    ],
    nl: [
      { type: 'ticket_resolved', message: 'Ticket #[ID] opgelost door [AGENT]', icon: '✅' },
      { type: 'high_satisfaction', message: 'Klant gaf 5 sterren', icon: '⭐' },
      { type: 'new_ticket', message: 'Nieuw ticket van [CUSTOMER]', icon: '📩' },
      { type: 'escalation', message: 'Ticket geëscaleerd naar specialist', icon: '🔴' },
      { type: 'ai_handled', message: 'AI heeft vraag succesvol afgehandeld', icon: '🤖' }
    ]
  };
  
  const agentNames = ['Sarah', 'John', 'Emma', 'Michael', 'Lisa'];
  const customerNames = generateCustomerName(lang);
  const recentActivities = [];
  
  for (let i = 0; i < 10; i++) {
    const activity = activities[lang][Math.floor(Math.random() * activities[lang].length)];
    const timestamp = new Date(Date.now() - Math.random() * 3600000); // Last hour
    
    recentActivities.push({
      id: generateId(),
      type: activity.type,
      message: activity.message
        .replace('[ID]', Math.floor(Math.random() * 9000) + 1000)
        .replace('[AGENT]', agentNames[Math.floor(Math.random() * agentNames.length)])
        .replace('[CUSTOMER]', customerNames),
      icon: activity.icon,
      timestamp: timestamp
    });
  }
  
  return recentActivities.sort((a, b) => b.timestamp - a.timestamp);
}

// Generate agent performance data
function generateAgentPerformance(lang) {
  const agents = ['Sarah Johnson', 'John Davis', 'Emma Wilson', 'Michael Brown', 'Lisa Anderson'];
  
  return agents.map((agent, index) => ({
    id: `agent-${index + 1}`,
    name: agent,
    status: Math.random() > 0.3 ? 'online' : 'offline',
    ticketsHandled: Math.floor(Math.random() * 50) + 20,
    avgResponseTime: Math.floor(Math.random() * 120) + 30,
    satisfaction: Math.floor(Math.random() * 15) + 85,
    languages: Math.random() > 0.5 ? ['en', 'nl'] : ['en']
  }));
}

// Generate live chat message
function generateLiveChatMessage(industry, lang) {
  const industryConfig = industries.data[industry];
  if (!industryConfig) return null;
  
  const messages = industryConfig.commonQuestions[lang];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    id: generateId(),
    content: message,
    timestamp: new Date(),
    customerName: generateCustomerName(lang),
    language: lang
  };
}

module.exports = {
  generateInitialTickets,
  generateAnalytics,
  generateLiveChatMessage,
  generateId,
  generateCustomerName
};