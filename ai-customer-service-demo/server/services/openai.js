const OpenAI = require('openai');
const industriesConfig = require('../config/industries');

// Initialize OpenAI client (only if API key is provided)
let openai = null;
const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : null;

console.log('API Key check:', {
  hasKey: !!apiKey,
  keyLength: apiKey ? apiKey.length : 0,
  startsWithSk: apiKey ? apiKey.startsWith('sk-') : false,
  firstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
});

if (apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.startsWith('sk-')) {
  try {
    openai = new OpenAI({
      apiKey: apiKey
    });
    console.log('OpenAI client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error.message);
  }
} else {
  console.log('OpenAI API key not configured or invalid, using fallback responses');
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
  
  // If scores are equal, check for common patterns
  if (dutchScore === englishScore) {
    if (message.match(/\b(uw|u|ik|wij|zij|hun)\b/i)) dutchScore++;
    if (message.match(/\b(your|i|we|they|their)\b/i)) englishScore++;
  }
  
  return dutchScore > englishScore ? 'nl' : 'en';
}

// Generate context-aware system prompts
function generateSystemPrompt(industry, language) {
  const industryData = industriesConfig.data[industry];
  if (!industryData) {
    console.error(`Industry ${industry} not found in config`);
    return null;
  }
  
  // For English prompts, use English data
  const enPrompt = `You are a professional AI customer service assistant for ${industryData.company.name.en}, a ${industryData.company.description.en}.

Company Context:
- Business hours: ${industryData.company.hours.en}
- Specialties: ${industryData.specialties.en.join(', ')}
- Common questions: ${industryData.commonQuestions.en.join(', ')}

Behavior Rules:
1. Respond ONLY in English
2. Be friendly, professional, and helpful
3. Use company-specific knowledge and terminology
4. Provide concrete solutions and clear next steps
5. If uncertain, offer to connect with a human specialist
6. Keep responses concise but complete (2-3 sentences maximum)
7. Reference business hours, services, and processes when relevant
8. For appointments: mention availability and booking process
9. For complaints: show empathy and offer immediate solutions
10. NEVER use placeholder text like [Your Name] - sign emails as the company team
11. Recognize when customers are ending conversations (e.g., "thanks", "ok", "see you") and respond appropriately without forcing continuation`;

  // For Dutch prompts, use Dutch data
  const nlPrompt = `Je bent een professionele AI klantenservice assistent voor ${industryData.company.name.nl}, een ${industryData.company.description.nl}.

Bedrijfscontext:
- Openingstijden: ${industryData.company.hours.nl}
- Specialiteiten: ${industryData.specialties.nl.join(', ')}
- Veelvoorkomende vragen: ${industryData.commonQuestions.nl.join(', ')}

Gedragsregels:
1. Antwoord ALLEEN in het Nederlands
2. Wees vriendelijk, professioneel en behulpzaam
3. Gebruik bedrijfsspecifieke kennis en terminologie
4. Bied concrete oplossingen en duidelijke vervolgstappen
5. Bij twijfel, bied aan om door te verbinden met een specialist
6. Houd antwoorden beknopt maar volledig (maximaal 2-3 zinnen)
7. Verwijs naar openingstijden, diensten en processen waar relevant
8. Voor afspraken: noem beschikbaarheid en boekingsproces
9. Voor klachten: toon empathie en bied directe oplossingen
10. Gebruik NOOIT placeholder tekst zoals [Uw Naam] - onderteken emails als het bedrijfsteam
11. Herken wanneer klanten gesprekken beëindigen (bijv. "bedankt", "ok", "tot dan") en reageer gepast zonder het gesprek te forceren`;
  
  const prompts = {
    en: enPrompt,
    nl: nlPrompt
  };
  
  return prompts[language];
}

// Main AI response generation
async function generateAIResponse(userMessage, industry, language = null, context = {}) {
  try {
    console.log('generateAIResponse called with:', { userMessage, industry, language, hasContext: !!context.messages });
    
    // Auto-detect language if not provided
    const detectedLang = language || detectLanguage(userMessage);
    console.log('Detected language:', detectedLang);
    
    // Get system prompt
    const systemPrompt = generateSystemPrompt(industry, detectedLang);
    if (!systemPrompt) {
      throw new Error('Invalid industry configuration');
    }
    
    // Build conversation history
    const messages = [
      { role: "system", content: systemPrompt }
    ];
    
    // Add context from previous messages if available
    if (context.messages && context.messages.length > 0) {
      // Keep last 6 messages for context (3 exchanges)
      const recentMessages = context.messages.slice(-6);
      messages.push(...recentMessages);
    }
    
    // Add current user message
    messages.push({ role: "user", content: userMessage });
    
    // Call OpenAI API if available, otherwise use fallback
    if (!openai) {
      console.log('OpenAI API key not configured, using fallback responses');
      return getFallbackResponse(userMessage, industry, detectedLang);
    }
    
    console.log('Calling OpenAI API with model: gpt-3.5-turbo');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });
    
    console.log('OpenAI API response received');
    return {
      message: completion.choices[0].message.content,
      language: detectedLang,
      confidence: 95,
      timestamp: new Date().toISOString(),
      usage: completion.usage
    };
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackResponse(userMessage, industry, language || 'en');
  }
}

// Fallback responses when API fails
function getFallbackResponse(userMessage, industry, language) {
  // More intelligent fallback responses based on industry
  const industryResponses = {
    healthcare: {
      en: {
        appointment: "I can see you'd like to schedule an appointment. We have availability tomorrow at 10:00 AM or Thursday at 2:00 PM. Which would work better for you?",
        pain: "I understand you're experiencing discomfort. For urgent dental pain, we can see you today. Please call our emergency line at 0800-DENTAL or I can schedule an urgent appointment for you.",
        general: "I'm here to help with your dental care needs. Whether it's scheduling, questions about treatments, or insurance matters, please let me know how I can assist you."
      },
      nl: {
        appointment: "Ik zie dat u een afspraak wilt maken. We hebben morgen om 10:00 uur of donderdag om 14:00 uur beschikbaar. Wat past het beste bij u?",
        pain: "Ik begrijp dat u pijn heeft. Voor urgente kiespijn kunnen we u vandaag nog zien. Bel onze spoedlijn op 0800-TANDARTS of ik kan direct een spoedafspraak voor u inplannen.",
        general: "Ik help u graag met uw tandheelkundige zorg. Of het nu gaat om afspraken, vragen over behandelingen of verzekeringszaken, laat me weten hoe ik u kan helpen."
      }
    },
    ecommerce: {
      en: {
        order: "I'll check your order status right away. Please provide your order number or email address so I can look it up for you.",
        return: "Our return policy allows returns within 30 days. I can start a return for you or email you a prepaid return label. What would you prefer?",
        general: "Welcome to our support! I can help you track orders, process returns, find products, or answer any questions about your shopping experience."
      },
      nl: {
        order: "Ik check direct uw bestelstatus. Kunt u uw ordernummer of e-mailadres geven zodat ik het voor u kan opzoeken?",
        return: "Ons retourbeleid staat retouren binnen 30 dagen toe. Ik kan een retour voor u starten of een retourlabel mailen. Wat heeft uw voorkeur?",
        general: "Welkom bij onze klantenservice! Ik kan u helpen met het volgen van bestellingen, retourneren, producten vinden of vragen over uw winkelervaring."
      }
    }
  };

  // Get industry-specific responses or use general ones
  const industryFallbacks = industryResponses[industry] || industryResponses.ecommerce;
  const langResponses = industryFallbacks[language] || industryFallbacks.en;
  
  // Determine response type based on keywords
  const lowerMessage = userMessage.toLowerCase();
  let responseType = 'general';
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('afspraak') || lowerMessage.includes('book')) {
    responseType = 'appointment';
  } else if (lowerMessage.includes('pain') || lowerMessage.includes('pijn') || lowerMessage.includes('urgent')) {
    responseType = 'pain';
  } else if (lowerMessage.includes('order') || lowerMessage.includes('bestelling') || lowerMessage.includes('track')) {
    responseType = 'order';
  } else if (lowerMessage.includes('return') || lowerMessage.includes('retour')) {
    responseType = 'return';
  }
  
  return {
    message: langResponses[responseType] || langResponses.general,
    language: language,
    confidence: 70,
    timestamp: new Date().toISOString(),
    fallback: true
  };
}

// Generate AI suggestions for agents
async function generateAgentSuggestion(ticketContent, customerLanguage, industry) {
  const systemPrompts = {
    en: `You are an AI assistant helping customer service agents. Generate a professional, empathetic response in English for the following customer inquiry. Keep it concise (2-3 sentences) and actionable.`,
    nl: `Je bent een AI-assistent die klantenservice medewerkers helpt. Genereer een professioneel, empathisch antwoord in het Nederlands voor de volgende klantvraag. Houd het beknopt (2-3 zinnen) en actionabel.`
  };
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompts[customerLanguage] },
        { role: "user", content: `Customer inquiry: "${ticketContent}"\n\nIndustry context: ${industry}` }
      ],
      max_tokens: 150,
      temperature: 0.6
    });
    
    return {
      suggestion: completion.choices[0].message.content,
      language: customerLanguage,
      confidence: 92
    };
  } catch (error) {
    // Return a generic suggestion template
    const templates = {
      en: "Thank you for reaching out. I understand your concern about [issue]. Let me help you by [action]. Would you like me to [next step]?",
      nl: "Bedankt voor uw bericht. Ik begrijp uw vraag over [onderwerp]. Ik help u graag door [actie]. Zal ik [volgende stap] voor u regelen?"
    };
    
    return {
      suggestion: templates[customerLanguage],
      language: customerLanguage,
      confidence: 60,
      fallback: true
    };
  }
}

module.exports = {
  generateAIResponse,
  generateAgentSuggestion,
  detectLanguage
};