const { createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const WebSocket = require('ws');

class VoiceAgentService {
    constructor() {
        // Initialize Deepgram client
        this.deepgram = createClient(process.env.DEEPGRAM_API_KEY || 'demo_api_key');
        
        // Initialize OpenAI client
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Active connections
        this.connections = new Map();
        this.agentConnections = new Map();
    }

    // Connect to Deepgram Voice Agent V1
    async connectVoiceAgent(socketId, config = {}) {
        try {
            const apiKey = process.env.DEEPGRAM_API_KEY;
            const url = `wss://agent.deepgram.com/v1/agent/converse`;
            
            const ws = new WebSocket(url, {
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            // Store connection
            this.agentConnections.set(socketId, ws);

            // Setup event handlers
            ws.on('open', () => {
                console.log('Connected to Deepgram Voice Agent V1');
                
                // Send initial Settings message (V1 format)
                const settings = {
                    type: 'Settings',
                    audio: {
                        input: {
                            encoding: 'linear16',
                            sample_rate: 16000
                        },
                        output: {
                            encoding: 'linear16',
                            sample_rate: 24000,
                            container: 'wav'
                        }
                    },
                    agent: {
                        listen: {
                            provider: {
                                type: 'deepgram',
                                model: 'nova-2'
                            }
                        },
                        think: {
                            provider: {
                                type: 'open_ai',
                                model: 'gpt-3.5-turbo',
                                api_key: process.env.OPENAI_API_KEY
                            },
                            prompt: config.prompt || 'You are a helpful AI assistant.'
                        },
                        speak: {
                            provider: {
                                type: 'deepgram',
                                model: config.voice || 'aura-asteria-en'
                            }
                        },
                        language: config.language || 'en',
                        greeting: config.greeting
                    }
                };
                
                ws.send(JSON.stringify(settings));
            });

            return ws;
        } catch (error) {
            console.error('Error connecting to Deepgram Voice Agent:', error);
            throw error;
        }
    }

    // Connect to Deepgram for live transcription (STT only)
    async connectLiveTranscription(socketId, config = {}) {
        try {
            const connection = this.deepgram.listen.live({
                model: 'nova-2',
                language: 'en',
                punctuate: true,
                smart_format: true,
                diarize: true,
                interim_results: true,
                utterance_end_ms: 1000,
                vad_events: true,
                ...config
            });

            // Store connection
            this.connections.set(socketId, connection);

            return connection;
        } catch (error) {
            console.error('Error connecting to Deepgram:', error);
            throw error;
        }
    }

    // Transcribe audio file
    async transcribeAudio(audioBuffer, options = {}) {
        try {
            const { result } = await this.deepgram.listen.prerecorded.transcribeFile(
                audioBuffer,
                {
                    model: 'nova-2',
                    punctuate: true,
                    smart_format: true,
                    diarize: true,
                    detect_language: true,
                    ...options
                }
            );

            const transcript = result.results.channels[0].alternatives[0];
            
            return {
                text: transcript.transcript,
                confidence: transcript.confidence,
                language: result.results.channels[0].detected_language || 'en',
                words: transcript.words || []
            };
        } catch (error) {
            console.error('Error transcribing audio:', error);
            throw error;
        }
    }

    // Text-to-speech using Deepgram
    async textToSpeech(text, options = {}) {
        try {
            const response = await this.deepgram.speak.request(
                { text },
                {
                    model: options.voice || 'aura-asteria-en',
                    encoding: 'mp3',
                    container: 'mp3',
                    sample_rate: 24000
                }
            );

            const stream = await response.getStream();
            const chunks = [];
            
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        } catch (error) {
            console.error('Error in text-to-speech:', error);
            throw error;
        }
    }

    // Process message with AI
    async processWithAI(message, context = {}) {
        try {
            const { industry, config, conversationHistory = [] } = context;
            
            // Build system prompt based on configuration
            const systemPrompt = this.buildSystemPrompt(industry, config);
            
            // Prepare messages for OpenAI
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                { role: 'user', content: message }
            ];

            // Get AI response
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
                stream: false
            });

            const response = completion.choices[0].message.content;
            
            // Analyze sentiment
            const sentiment = await this.analyzeSentiment(message);
            
            return {
                response,
                sentiment,
                confidence: 0.95
            };
        } catch (error) {
            console.error('Error processing with AI:', error);
            throw error;
        }
    }

    // Build system prompt based on configuration
    buildSystemPrompt(industry, config) {
        const industryPrompts = {
            healthcare: `You are a professional healthcare AI assistant. You help patients with appointments, medical information, and general health inquiries. Be empathetic, professional, and always recommend consulting with healthcare professionals for medical advice.`,
            ecommerce: `You are an e-commerce customer service AI. You assist customers with orders, returns, product information, and shopping assistance. Be helpful, friendly, and focused on customer satisfaction.`,
            beauty: `You are a beauty salon AI assistant. You help clients book appointments, learn about services, and get beauty advice. Be warm, welcoming, and knowledgeable about beauty treatments.`,
            realestate: `You are a real estate AI assistant. You help clients with property listings, scheduling viewings, and answering questions about the buying/selling process. Be professional, informative, and attentive to client needs.`,
            financial: `You are a financial services AI assistant. You help customers with banking, investments, and financial planning. Be professional, secure-minded, and clear about financial information.`,
            hospitality: `You are a restaurant AI host. You help guests with reservations, menu information, and dining preferences. Be warm, welcoming, and knowledgeable about the cuisine.`,
            education: `You are an educational institution AI advisor. You help students with enrollment, course information, and academic support. Be supportive, informative, and encouraging.`,
            automotive: `You are an automotive service AI advisor. You help customers with service appointments, vehicle maintenance, and repair information. Be knowledgeable, helpful, and transparent about services.`
        };

        const personalityModifiers = {
            professional: 'Maintain a professional and formal tone.',
            friendly: 'Be warm, friendly, and conversational.',
            empathetic: 'Show genuine empathy and understanding.',
            efficient: 'Be concise, direct, and solution-focused.',
            casual: 'Use a relaxed, casual tone while remaining helpful.'
        };

        const lengthModifiers = {
            concise: 'Keep responses brief and to the point.',
            balanced: 'Provide adequate detail without being too lengthy.',
            detailed: 'Give comprehensive, detailed responses.'
        };

        let prompt = industryPrompts[industry] || industryPrompts.healthcare;
        
        if (config.personality) {
            prompt += ` ${personalityModifiers[config.personality]}`;
        }
        
        if (config.responseLength) {
            prompt += ` ${lengthModifiers[config.responseLength]}`;
        }
        
        if (config.customInstructions) {
            prompt += ` Additional instructions: ${config.customInstructions}`;
        }
        
        if (config.companyName) {
            prompt += ` You work for ${config.companyName}.`;
        }

        return prompt;
    }

    // Analyze sentiment of the message
    async analyzeSentiment(text) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Analyze the sentiment of the following text and respond with only one word: Positive, Negative, or Neutral.'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0,
                max_tokens: 10
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return 'Neutral';
        }
    }

    // Get analytics data
    getAnalytics(industry) {
        // Mock analytics data for demo
        return {
            totalCalls: 1247,
            avgResponseTime: 2.3,
            satisfactionRate: 94,
            costSavings: 12450,
            callVolume: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [145, 189, 156, 203, 178, 92, 45]
            },
            resolutionRate: {
                labels: ['Billing', 'Technical', 'Sales', 'Support', 'Other'],
                data: [95, 88, 92, 90, 85]
            },
            trends: {
                calls: '+12%',
                responseTime: '-0.5s',
                satisfaction: '+3%'
            }
        };
    }

    // Get active Voice Agent connection
    getConnection(socketId) {
        return this.agentConnections.get(socketId);
    }

    // Clean up Voice Agent connection
    disconnectVoiceAgent(socketId) {
        const ws = this.agentConnections.get(socketId);
        if (ws) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            this.agentConnections.delete(socketId);
            console.log(`Disconnected Voice Agent for socket ${socketId}`);
        }
    }

    // Clean up STT connection
    disconnectTranscription(socketId) {
        const connection = this.connections.get(socketId);
        if (connection) {
            connection.finish();
            this.connections.delete(socketId);
        }
    }
}

module.exports = new VoiceAgentService();