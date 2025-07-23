const industries = {
  healthcare: {
    id: 'healthcare',
    icon: '🏥',
    company: {
      name: {
        en: "Smile Dental Practice",
        nl: "Tandartspraktijk De Glimlach"
      },
      description: {
        en: "modern dental practice",
        nl: "moderne tandartspraktijk"
      },
      hours: {
        en: "Mon-Fri 08:00-18:00, Sat 09:00-13:00",
        nl: "Ma-Vr 08:00-18:00, Za 09:00-13:00"
      },
      colors: { primary: "#4CAF50", secondary: "#81C784" }
    },
    specialties: {
      en: ["preventive care", "cosmetic dentistry", "implantology", "orthodontics"],
      nl: ["preventieve zorg", "cosmetische tandheelkunde", "implantologie", "orthodontie"]
    },
    commonQuestions: {
      en: ["book appointment", "pain complaints", "insurance coverage", "treatment costs", "emergency care"],
      nl: ["afspraak maken", "pijn klachten", "verzekering dekking", "behandeling kosten", "spoedhulp"]
    },
    quickSuggestions: {
      en: [
        "Book appointment",
        "Pain/urgent issue",
        "Insurance/costs",
        "Treatment explanation",
        "Opening hours"
      ],
      nl: [
        "Afspraak inplannen",
        "Pijn/urgente klacht",
        "Verzekering/kosten",
        "Behandeling uitleg",
        "Openingstijden"
      ]
    },
    mockTickets: {
      en: [
        "Patient has severe tooth pain since yesterday",
        "Question about root canal treatment costs",
        "Need to reschedule checkup appointment",
        "Insurance doesn't cover treatment?",
        "Wisdom tooth extraction inquiry"
      ],
      nl: [
        "Patiënt heeft erge kiespijn sinds gisteren",
        "Vraag over kosten wortelkanaalbehandeling",
        "Controle afspraak moet verzet worden",
        "Verzekering dekt behandeling niet?",
        "Informatie over verstandskies trekken"
      ]
    }
  },
  
  ecommerce: {
    id: 'ecommerce',
    icon: '🛒',
    company: {
      name: {
        en: "TrendyStyle Fashion",
        nl: "TrendyStyle Mode"
      },
      description: {
        en: "online fashion retailer",
        nl: "online mode retailer"
      },
      hours: {
        en: "24/7 online, Support: Mon-Fri 09:00-21:00",
        nl: "24/7 online, Support: Ma-Vr 09:00-21:00"
      },
      colors: { primary: "#E91E63", secondary: "#F06292" }
    },
    specialties: {
      en: ["fast fashion", "sustainable clothing", "accessories", "shoes"],
      nl: ["fast fashion", "duurzame kleding", "accessoires", "schoenen"]
    },
    commonQuestions: {
      en: ["order status", "returns", "sizing", "shipping costs", "payment methods"],
      nl: ["bestelstatus", "retourneren", "maatvoering", "verzendkosten", "betaalmethoden"]
    },
    quickSuggestions: {
      en: [
        "Track my order",
        "Return item",
        "Size guide",
        "Shipping info",
        "Payment issue"
      ],
      nl: [
        "Bestelling volgen",
        "Product retourneren",
        "Maattabel",
        "Verzendinfo",
        "Betaalprobleem"
      ]
    },
    mockTickets: {
      en: [
        "Where is my order #12345?",
        "Item doesn't fit, need size exchange",
        "Payment failed but money deducted",
        "Damaged item received",
        "Wrong color delivered"
      ],
      nl: [
        "Waar is mijn bestelling #12345?",
        "Product past niet, maat ruilen graag",
        "Betaling mislukt maar geld afgeschreven",
        "Beschadigd item ontvangen",
        "Verkeerde kleur geleverd"
      ]
    }
  },
  
  realestate: {
    id: 'realestate',
    icon: '🏠',
    company: {
      name: {
        en: "PropertyExpert Realty",
        nl: "VastgoedXpert Makelaars"
      },
      description: {
        en: "real estate agency",
        nl: "makelaarskantoor"
      },
      hours: {
        en: "Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        nl: "Ma-Vr 09:00-18:00, Za 10:00-16:00"
      },
      colors: { primary: "#3F51B5", secondary: "#7986CB" }
    },
    specialties: {
      en: ["residential sales", "rentals", "commercial property", "property management"],
      nl: ["woningverkoop", "verhuur", "bedrijfspanden", "vastgoedbeheer"]
    },
    commonQuestions: {
      en: ["schedule viewing", "property valuation", "mortgage advice", "rental requirements", "commission fees"],
      nl: ["bezichtiging plannen", "woning taxatie", "hypotheek advies", "huur voorwaarden", "courtage kosten"]
    },
    quickSuggestions: {
      en: [
        "Schedule viewing",
        "Property value",
        "Mortgage info",
        "Rental listings",
        "Selling process"
      ],
      nl: [
        "Bezichtiging plannen",
        "Woning waarde",
        "Hypotheek info",
        "Huurwoningen",
        "Verkoop proces"
      ]
    },
    mockTickets: {
      en: [
        "Interested in house on Main Street 45",
        "Need property valuation for sale",
        "Looking for 3-bedroom rental",
        "Questions about buying process",
        "Mortgage pre-approval help needed"
      ],
      nl: [
        "Interesse in woning Hoofdstraat 45",
        "Graag taxatie voor verkoop woning",
        "Zoek 3-kamer huurwoning",
        "Vragen over aankoopproces",
        "Hulp bij hypotheek aanvraag"
      ]
    }
  },
  
  energy: {
    id: 'energy',
    icon: '⚡',
    company: {
      name: {
        en: "GreenPower Energy",
        nl: "GreenPower Energie"
      },
      description: {
        en: "sustainable energy provider",
        nl: "duurzame energieleverancier"
      },
      hours: {
        en: "Mon-Fri 08:00-20:00, Sat 09:00-17:00",
        nl: "Ma-Vr 08:00-20:00, Za 09:00-17:00"
      },
      colors: { primary: "#4CAF50", secondary: "#81C784" }
    },
    specialties: {
      en: ["green energy", "solar panels", "smart meters", "energy contracts"],
      nl: ["groene energie", "zonnepanelen", "slimme meters", "energiecontracten"]
    },
    commonQuestions: {
      en: ["switch provider", "meter reading", "billing", "solar installation", "contract terms"],
      nl: ["overstappen", "meterstand", "factuur", "zonnepanelen installatie", "contract voorwaarden"]
    },
    quickSuggestions: {
      en: [
        "Switch to green",
        "Submit reading",
        "Bill question",
        "Solar panels",
        "Contract info"
      ],
      nl: [
        "Overstap groen",
        "Meterstand doorgeven",
        "Factuur vraag",
        "Zonnepanelen",
        "Contract info"
      ]
    },
    mockTickets: {
      en: [
        "Want to switch to renewable energy",
        "High electricity bill this month",
        "Smart meter installation schedule",
        "Solar panel subsidy information",
        "Moving house, transfer contract"
      ],
      nl: [
        "Wil overstappen op groene energie",
        "Hoge elektriciteitsrekening deze maand",
        "Slimme meter installatie plannen",
        "Informatie subsidie zonnepanelen",
        "Verhuizing, contract meenemen"
      ]
    }
  },
  
  automotive: {
    id: 'automotive',
    icon: '🚗',
    company: {
      name: {
        en: "AutoService Center",
        nl: "AutoService Centrum"
      },
      description: {
        en: "full-service auto repair shop",
        nl: "full-service autoreparatie werkplaats"
      },
      hours: {
        en: "Mon-Fri 08:00-18:00, Sat 09:00-15:00",
        nl: "Ma-Vr 08:00-18:00, Za 09:00-15:00"
      },
      colors: { primary: "#FF5722", secondary: "#FF8A65" }
    },
    specialties: {
      en: ["maintenance", "repairs", "diagnostics", "tire service", "MOT testing"],
      nl: ["onderhoud", "reparaties", "diagnose", "banden service", "APK keuring"]
    },
    commonQuestions: {
      en: ["service appointment", "repair quote", "MOT test", "maintenance schedule", "warranty"],
      nl: ["service afspraak", "reparatie offerte", "APK keuring", "onderhoudsschema", "garantie"]
    },
    quickSuggestions: {
      en: [
        "Book service",
        "Get quote",
        "MOT booking",
        "Check warranty",
        "Emergency help"
      ],
      nl: [
        "Service boeken",
        "Offerte aanvragen",
        "APK plannen",
        "Garantie check",
        "Pech hulp"
      ]
    },
    mockTickets: {
      en: [
        "Car making strange noise when braking",
        "Need annual service appointment",
        "MOT test due next month",
        "Quote for new tires needed",
        "Engine warning light is on"
      ],
      nl: [
        "Auto maakt vreemd geluid bij remmen",
        "Jaarlijkse onderhoudsbeurt nodig",
        "APK vervalt volgende maand",
        "Offerte voor nieuwe banden graag",
        "Motor waarschuwingslampje brandt"
      ]
    }
  },
  
  hospitality: {
    id: 'hospitality',
    icon: '🏨',
    company: {
      name: {
        en: "Restaurant La Bella Vista",
        nl: "Restaurant La Bella Vista"
      },
      description: {
        en: "fine dining Italian restaurant",
        nl: "fine dining Italiaans restaurant"
      },
      hours: {
        en: "Tue-Sun 17:00-23:00, Closed Mondays",
        nl: "Di-Zo 17:00-23:00, Maandag gesloten"
      },
      colors: { primary: "#795548", secondary: "#A1887F" }
    },
    specialties: {
      en: ["authentic Italian", "wine selection", "private dining", "catering"],
      nl: ["authentiek Italiaans", "wijnselectie", "privé dining", "catering"]
    },
    commonQuestions: {
      en: ["table reservation", "menu options", "dietary restrictions", "group bookings", "event hosting"],
      nl: ["tafel reserveren", "menu opties", "dieetwensen", "groepsreserveringen", "evenementen"]
    },
    quickSuggestions: {
      en: [
        "Book table",
        "View menu",
        "Dietary needs",
        "Group booking",
        "Special event"
      ],
      nl: [
        "Tafel boeken",
        "Menu bekijken",
        "Dieetwensen",
        "Groep reserveren",
        "Speciaal event"
      ]
    },
    mockTickets: {
      en: [
        "Table for 4 this Saturday evening",
        "Vegetarian menu options available?",
        "Planning anniversary dinner",
        "Wine pairing recommendations",
        "Private room for 20 people"
      ],
      nl: [
        "Tafel voor 4 deze zaterdag avond",
        "Vegetarische menu opties beschikbaar?",
        "Jubileum diner plannen",
        "Wijn advies bij menu",
        "Privé ruimte voor 20 personen"
      ]
    }
  },
  
  financial: {
    id: 'financial',
    icon: '💼',
    company: {
      name: {
        en: "FinanceFirst Advisors",
        nl: "FinanceFirst Adviseurs"
      },
      description: {
        en: "financial advisory firm",
        nl: "financieel adviesbureau"
      },
      hours: {
        en: "Mon-Fri 09:00-17:30",
        nl: "Ma-Vr 09:00-17:30"
      },
      colors: { primary: "#2196F3", secondary: "#64B5F6" }
    },
    specialties: {
      en: ["investment advice", "tax planning", "retirement planning", "mortgage advice"],
      nl: ["beleggingsadvies", "belastingplanning", "pensioenplanning", "hypotheekadvies"]
    },
    commonQuestions: {
      en: ["consultation booking", "investment options", "tax optimization", "pension advice", "financial planning"],
      nl: ["consult inplannen", "beleggingsopties", "belasting optimalisatie", "pensioen advies", "financiële planning"]
    },
    quickSuggestions: {
      en: [
        "Book consult",
        "Investment info",
        "Tax advice",
        "Pension planning",
        "Mortgage help"
      ],
      nl: [
        "Consult boeken",
        "Belegging info",
        "Belasting advies",
        "Pensioen planning",
        "Hypotheek hulp"
      ]
    },
    mockTickets: {
      en: [
        "Need advice on investment portfolio",
        "Tax return assistance needed",
        "Planning for early retirement",
        "Mortgage refinancing options",
        "Setting up savings plan for children"
      ],
      nl: [
        "Advies nodig over beleggingsportefeuille",
        "Hulp bij belastingaangifte",
        "Plannen voor vervroegd pensioen",
        "Hypotheek oversluiten opties",
        "Spaarplan opzetten voor kinderen"
      ]
    }
  },
  
  education: {
    id: 'education',
    icon: '📚',
    company: {
      name: {
        en: "TechCollege Online",
        nl: "TechCollege Nederland"
      },
      description: {
        en: "online technology education platform",
        nl: "online technologie onderwijs platform"
      },
      hours: {
        en: "Support: Mon-Fri 09:00-18:00",
        nl: "Support: Ma-Vr 09:00-18:00"
      },
      colors: { primary: "#9C27B0", secondary: "#BA68C8" }
    },
    specialties: {
      en: ["programming courses", "data science", "web development", "AI/ML training"],
      nl: ["programmeer cursussen", "data science", "web development", "AI/ML training"]
    },
    commonQuestions: {
      en: ["course enrollment", "technical support", "certification", "payment plans", "career guidance"],
      nl: ["cursus inschrijving", "technische support", "certificering", "betaalplannen", "carrière begeleiding"]
    },
    quickSuggestions: {
      en: [
        "Enroll course",
        "Tech support",
        "Get certificate",
        "Payment plan",
        "Career advice"
      ],
      nl: [
        "Cursus starten",
        "Tech support",
        "Certificaat info",
        "Betaalplan",
        "Carrière advies"
      ]
    },
    mockTickets: {
      en: [
        "Can't access course materials",
        "Question about Python course",
        "Need payment plan for bootcamp",
        "Certificate not received yet",
        "Career path advice for data science"
      ],
      nl: [
        "Kan niet bij cursusmateriaal",
        "Vraag over Python cursus",
        "Betaalplan nodig voor bootcamp",
        "Certificaat nog niet ontvangen",
        "Carrière advies voor data science"
      ]
    }
  }
};

// Helper functions
function getIndustriesForLang(lang) {
  const result = {};
  Object.keys(industries).forEach(key => {
    const industry = industries[key];
    result[key] = {
      id: industry.id,
      icon: industry.icon,
      name: industry.company.name[lang],
      description: industry.company.description[lang],
      colors: industry.company.colors
    };
  });
  return result;
}

function getIndustryConfig(industryId, lang) {
  const industry = industries[industryId];
  if (!industry) return null;
  
  return {
    ...industry,
    // Return only language-specific data
    company: {
      name: industry.company.name[lang],
      description: industry.company.description[lang],
      hours: industry.company.hours[lang],
      colors: industry.company.colors
    },
    specialties: industry.specialties[lang],
    commonQuestions: industry.commonQuestions[lang],
    quickSuggestions: industry.quickSuggestions[lang],
    mockTickets: industry.mockTickets[lang]
  };
}

module.exports = {
  data: industries,
  getIndustriesForLang,
  getIndustryConfig
};