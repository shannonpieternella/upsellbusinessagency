// Voice Agent Implementation with Deepgram
class VoiceAgent {
    constructor() {
        this.socket = null;
        this.deepgramSocket = null;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.isRecording = false;
        this.isSpeaking = false;
        this.isConversationActive = false;
        this.audioQueue = [];
        this.isPlayingAudio = false;
        this.currentIndustry = 'healthcare';
        this.config = {
            voiceModel: 'aura-asteria-en',
            speechSpeed: 1.0,
            personality: 'professional',
            responseLength: 'balanced',
            customInstructions: '',
            companyName: '',
            greetingMessage: ''
        };
        this.conversationHistory = [];
        this.waveform = null;
        this.messageQueue = [];
        this.isProcessing = false;
        this.silenceTimer = null;
        this.lastSpeechTime = Date.now();
        
        this.init();
    }

    init() {
        this.setupSocketConnection();
        this.setupEventListeners();
        this.loadIndustryScenarios();
        this.initializeWaveform();
        this.setupCharts();
        this.restoreConfig();
    }

    setupSocketConnection() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateStatus('ready', 'Connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateStatus('offline', 'Disconnected');
        });

        // V1 Voice Agent message handlers
        this.socket.on('deepgram-connected', (data) => {
            console.log('Connected to Deepgram Voice Agent', data);
            this.updateStatus('ready', 'Voice Agent Ready');
        });

        this.socket.on('settings-applied', () => {
            console.log('Voice Agent settings applied');
        });

        this.socket.on('prompt-updated', () => {
            console.log('Voice Agent prompt updated');
            this.showSuccess('AI personality updated');
        });

        this.socket.on('speak-updated', () => {
            console.log('Voice settings updated');
            this.showSuccess('Voice settings updated');
        });

        this.socket.on('user-started-speaking', () => {
            if (this.isConversationActive) {
                this.updateStatus('active', '👂 Listening to you...');
                document.querySelector('.ai-avatar').classList.add('listening');
                // Pause any ongoing audio playback
                this.audioQueue = [];
            }
        });

        this.socket.on('agent-thinking', (data) => {
            this.updateStatus('speaking', 'AI thinking...');
            console.log('AI thinking:', data.content);
        });

        this.socket.on('conversation-text', (data) => {
            if (data.role === 'user') {
                this.addUserMessage(data.content);
            } else if (data.role === 'agent' || data.role === 'assistant') {
                this.addAIMessage(data.content);
            }
        });

        this.socket.on('agent-started-speaking', () => {
            this.isSpeaking = true;
            this.updateStatus('speaking', 'AI speaking...');
            document.querySelector('.ai-avatar').classList.remove('listening');
            document.querySelector('.ai-avatar').classList.add('speaking');
        });

        this.socket.on('agent-audio-done', () => {
            this.isSpeaking = false;
            document.querySelector('.ai-avatar').classList.remove('speaking');
            if (this.isConversationActive) {
                // Automatically go back to listening after AI finishes speaking
                document.querySelector('.ai-avatar').classList.add('listening');
                this.updateStatus('active', 'Listening... (speak anytime)');
                // Resume audio streaming if needed
                this.resumeListening();
            } else if (this.isRecording) {
                document.querySelector('.ai-avatar').classList.add('listening');
                this.updateStatus('active', 'Listening...');
            } else {
                this.updateStatus('ready', 'Ready');
            }
        });

        this.socket.on('audio-data', (audioData) => {
            // Queue audio for continuous playback
            this.audioQueue.push(audioData);
            if (!this.isPlayingAudio) {
                this.processAudioQueue();
            }
        });

        this.socket.on('warning', (data) => {
            console.warn('Voice Agent warning:', data);
            this.showError(`Warning: ${data.description}`);
        });

        this.socket.on('error', (data) => {
            console.error('Voice Agent error:', data);
            this.showError(`Error: ${data.description}`);
        });

        this.socket.on('function-call-request', (func) => {
            console.log('Function call request:', func);
            // Handle client-side function calls if needed
        });

        this.socket.on('deepgram-error', (error) => {
            console.error('Deepgram connection error:', error);
            this.showError('Voice Agent connection error');
            this.stopConversation();
        });

        this.socket.on('deepgram-disconnected', () => {
            console.log('Disconnected from Deepgram');
            this.updateStatus('ready', 'Disconnected');
        });

        // Legacy handlers for backwards compatibility
        this.socket.on('voice-response', (data) => {
            this.handleVoiceResponse(data);
        });

        this.socket.on('transcription', (data) => {
            this.handleTranscription(data);
        });
    }

    setupEventListeners() {
        // Industry selector
        document.getElementById('industrySelect').addEventListener('change', (e) => {
            this.currentIndustry = e.target.value;
            this.loadIndustryScenarios();
            this.updateGreeting();
        });

        // Voice controls
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startConversation();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopConversation();
        });

        // Chat input
        const chatInput = document.createElement('div');
        chatInput.className = 'chat-input-container';
        chatInput.innerHTML = `
            <div class="chat-input-wrapper">
                <input type="text" id="chatInput" class="chat-input" placeholder="Type your message or click the mic to speak...">
                <div class="input-actions">
                    <button class="input-btn voice-input-btn" id="voiceInputBtn" data-tooltip="Click to speak">
                        <i class='bx bx-microphone'></i>
                    </button>
                    <button class="input-btn send-btn" id="sendBtn" data-tooltip="Send message">
                        <i class='bx bx-send'></i>
                    </button>
                </div>
            </div>
            <div class="input-status" id="inputStatus" style="display: none;">
                <span class="status-icon"></span>
                <span class="status-text"></span>
            </div>
        `;
        
        // Insert chat input after conversation content
        const conversationPanel = document.querySelector('.conversation-panel');
        const metricsSection = document.querySelector('.conversation-metrics');
        conversationPanel.insertBefore(chatInput, metricsSection);

        // Chat input events
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('voiceInputBtn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Configuration
        document.getElementById('voiceModel').addEventListener('change', (e) => {
            this.config.voiceModel = e.target.value;
        });

        document.getElementById('speechSpeed').addEventListener('input', (e) => {
            this.config.speechSpeed = parseFloat(e.target.value);
            document.querySelector('.slider-value').textContent = `${this.config.speechSpeed}x`;
        });

        document.getElementById('personality').addEventListener('change', (e) => {
            this.config.personality = e.target.value;
        });

        document.getElementById('responseLength').addEventListener('change', (e) => {
            this.config.responseLength = e.target.value;
        });

        document.getElementById('customInstructions').addEventListener('input', (e) => {
            this.config.customInstructions = e.target.value;
        });

        document.getElementById('saveConfig').addEventListener('click', () => {
            this.saveConfiguration();
            // Update Voice Agent settings if connected
            if (this.deepgramConnected) {
                this.updateAgentPrompt();
                this.updateAgentVoice();
            }
        });

        // Actions
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearConversation();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportConversation();
        });

        // Modals
        document.getElementById('analyticsBtn').addEventListener('click', () => {
            this.showAnalytics();
        });

        document.getElementById('customizeBtn').addEventListener('click', () => {
            this.showCustomize();
        });

        document.getElementById('closeAnalytics').addEventListener('click', () => {
            document.getElementById('analyticsModal').classList.remove('active');
        });

        document.getElementById('closeCustomize').addEventListener('click', () => {
            document.getElementById('customizeModal').classList.remove('active');
        });

        document.getElementById('applyCustomization').addEventListener('click', () => {
            this.applyCustomization();
        });
    }

    async startConversation() {
        try {
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Get user media with specific constraints for Deepgram
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Connect to Deepgram Voice Agent first
            await this.connectToDeepgram();
            
            // Setup continuous audio streaming
            this.setupAudioStreaming(stream);
            
            // Update UI
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'flex';
            document.getElementById('modeIndicator').style.display = 'block';
            document.querySelector('.ai-avatar').classList.add('listening');
            document.querySelector('.waveform-container').classList.add('active');
            
            // Enable continuous conversation mode
            this.isRecording = true;
            this.isConversationActive = true;
            
            // Update status with instructions
            this.updateStatus('active', '🎤 Listening... Just speak naturally!');
            
            // Show instructions
            this.showSuccess('Hands-free mode active! Just speak naturally and I\'ll respond.');
            
        } catch (error) {
            console.error('Error starting conversation:', error);
            this.showError('Failed to access microphone. Please check permissions.');
        }
    }

    setupAudioStreaming(stream) {
        // Create a ScriptProcessorNode to capture audio data
        const source = this.audioContext.createMediaStreamSource(stream);
        const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
            // Don't stream audio while AI is speaking to avoid feedback
            if (!this.isRecording || !this.deepgramConnected || this.isSpeaking || this.isPlayingAudio) return;
            
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Simple voice activity detection
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
                sum += Math.abs(inputData[i]);
            }
            const average = sum / inputData.length;
            
            // Only send audio if there's actual sound (not silence)
            if (average > 0.01) { // Threshold for voice activity
                this.lastSpeechTime = Date.now();
                
                // Convert float32 to int16 for Deepgram
                const int16Data = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                
                // Send audio data to server to forward to Deepgram
                if (this.socket && this.socket.connected && this.isConversationActive) {
                    this.socket.emit('stream-audio', {
                        audio: int16Data.buffer,
                        socketId: this.socket.id
                    });
                }
            }
        };
        
        source.connect(processor);
        processor.connect(this.audioContext.destination);
        
        this.audioProcessor = processor;
        this.audioSource = source;
        this.stream = stream;
    }

    async processAudioQueue() {
        if (this.audioQueue.length === 0) {
            this.isPlayingAudio = false;
            return;
        }
        
        this.isPlayingAudio = true;
        const audioData = this.audioQueue.shift();
        
        try {
            // Pause listening while playing audio to avoid feedback
            this.pauseListening();
            
            // Convert base64 audio data to ArrayBuffer
            const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0)).buffer;
            
            // Decode audio data
            const decodedAudio = await this.audioContext.decodeAudioData(audioBuffer);
            
            // Create and play audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = decodedAudio;
            source.connect(this.audioContext.destination);
            
            source.onended = () => {
                // Process next audio in queue
                this.processAudioQueue();
            };
            
            source.start();
            
        } catch (error) {
            console.error('Error playing audio:', error);
            // Continue with next audio even if this one fails
            this.processAudioQueue();
        }
    }
    
    async playAudioData(audioData) {
        // Add to queue for sequential playback
        this.audioQueue.push(audioData);
        if (!this.isPlayingAudio) {
            this.processAudioQueue();
        }
    }
    
    pauseListening() {
        // Temporarily pause audio input to avoid feedback
        this.wasRecording = this.isRecording;
        this.isRecording = false;
    }
    
    resumeListening() {
        // Resume audio input after AI finishes speaking
        if (this.isConversationActive && this.wasRecording) {
            this.isRecording = true;
            this.wasRecording = false;
        }
    }

    stopConversation() {
        this.isRecording = false;
        this.isConversationActive = false;
        this.deepgramConnected = false;
        
        // Clear audio queue
        this.audioQueue = [];
        this.isPlayingAudio = false;
        
        // Clear any timers
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        
        // Disconnect audio streaming
        if (this.audioProcessor) {
            this.audioProcessor.disconnect();
            this.audioProcessor = null;
        }
        
        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        // Disconnect from Deepgram
        if (this.socket && this.socket.connected) {
            this.socket.emit('disconnect-deepgram', { socketId: this.socket.id });
        }
        
        // Update UI
        document.getElementById('startBtn').style.display = 'flex';
        document.getElementById('stopBtn').style.display = 'none';
        document.getElementById('modeIndicator').style.display = 'none';
        document.querySelector('.ai-avatar').classList.remove('listening', 'speaking');
        document.querySelector('.waveform-container').classList.remove('active');
        
        // Update status
        this.updateStatus('ready', 'Ready');
        this.showSuccess('Conversation ended. Click "Start Conversation" to begin again.');
    }

    async connectToDeepgram() {
        return new Promise((resolve, reject) => {
            // Connect to Deepgram Voice Agent via server
            this.socket.emit('connect-deepgram', {
                industry: this.currentIndustry,
                config: this.config
            });
            
            // Set up one-time listener for connection confirmation
            const connectionTimeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);
            
            this.socket.once('deepgram-connected', (data) => {
                clearTimeout(connectionTimeout);
                this.deepgramConnected = true;
                console.log('Successfully connected to Deepgram Voice Agent');
                resolve(data);
            });
            
            this.socket.once('deepgram-error', (error) => {
                clearTimeout(connectionTimeout);
                reject(new Error(error));
            });
        });
    }

    updateAgentPrompt() {
        if (!this.deepgramConnected) return;
        
        // Send UpdatePrompt message to change AI behavior
        this.socket.emit('update-prompt', {
            socketId: this.socket.id,
            prompt: this.buildSystemPrompt()
        });
    }

    updateAgentVoice() {
        if (!this.deepgramConnected) return;
        
        // Send UpdateSpeak message to change voice settings
        this.socket.emit('update-speak', {
            socketId: this.socket.id,
            model: this.config.voiceModel
        });
    }

    buildSystemPrompt() {
        const industryPrompts = {
            healthcare: `You are a professional healthcare AI assistant. Help patients with appointments and medical inquiries.`,
            ecommerce: `You are an e-commerce customer service AI. Assist with orders, returns, and shopping.`,
            beauty: `You are a beauty salon AI assistant. Help with appointments and beauty services.`,
            realestate: `You are a real estate AI assistant. Help with property listings and viewings.`,
            financial: `You are a financial services AI. Help with banking and investments.`,
            hospitality: `You are a restaurant AI host. Help with reservations and menu information.`,
            education: `You are an educational AI advisor. Help with enrollment and courses.`,
            automotive: `You are an automotive service AI. Help with service appointments and repairs.`
        };
        
        let prompt = industryPrompts[this.currentIndustry] || industryPrompts.healthcare;
        
        if (this.config.personality) {
            prompt += ` Be ${this.config.personality}.`;
        }
        
        if (this.config.responseLength) {
            prompt += ` Keep responses ${this.config.responseLength}.`;
        }
        
        if (this.config.customInstructions) {
            prompt += ` ${this.config.customInstructions}`;
        }
        
        if (this.config.companyName) {
            prompt += ` You work for ${this.config.companyName}.`;
        }
        
        return prompt;
    }

    async processAudio(audioBlob) {
        const startTime = Date.now();
        
        // Show processing indicator
        this.updateStatus('speaking', 'Processing...');
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            
            // Send to server for processing
            this.socket.emit('process-audio', {
                audio: base64Audio,
                industry: this.currentIndustry,
                config: this.config,
                conversationHistory: this.conversationHistory
            });
        };
    }

    handleTranscription(data) {
        const { text, confidence, language } = data;
        
        // Add user message
        this.addUserMessage(text);
        
        // Update metrics
        document.getElementById('confidence').textContent = `${Math.round(confidence * 100)}%`;
        document.getElementById('detectedLang').textContent = language.toUpperCase();
        
        // Process with AI
        this.processWithAI(text);
    }

    async processWithAI(text) {
        const startTime = Date.now();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/voice-agent/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    industry: this.currentIndustry,
                    config: this.config,
                    conversationHistory: this.conversationHistory
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addAIMessage(data.response);
            
            // Update metrics
            const responseTime = Date.now() - startTime;
            document.getElementById('responseTime').textContent = `${responseTime}ms`;
            document.getElementById('sentiment').textContent = data.sentiment || 'Neutral';
            
            // Always speak the response (whether in voice mode or text mode)
            this.speak(data.response);
            
        } catch (error) {
            console.error('Error processing with AI:', error);
            this.hideTypingIndicator();
            // Provide a demo response since backend might not be fully configured
            const demoResponse = this.getDemoResponse(text);
            this.addAIMessage(demoResponse);
            this.speak(demoResponse);
        }
    }
    
    getDemoResponse(text) {
        const responses = {
            healthcare: [
                "I'd be happy to help you schedule an appointment. We have availability tomorrow at 2 PM or Thursday at 10 AM. Which would work better for you?",
                "I understand you're experiencing discomfort. For urgent matters, we can arrange a same-day appointment. Would you like me to check our emergency slots?",
                "Your insurance is accepted at our practice. We work with most major providers. Would you like me to verify your specific coverage?"
            ],
            ecommerce: [
                "I can help you track your order. Let me pull up your order information. Your package is currently in transit and should arrive within 2-3 business days.",
                "I'd be happy to assist with your return. Our return policy allows 30 days for most items. Would you like me to email you a prepaid return label?",
                "That product is currently in stock! We have 5 units available. Would you like me to add it to your cart?"
            ],
            beauty: [
                "I can schedule your appointment right away. We have openings today at 3 PM or tomorrow at 11 AM. Which time works best for you?",
                "Our full service menu includes haircuts, coloring, manicures, pedicures, and facial treatments. What service are you interested in?",
                "A manicure is $35 and takes about 45 minutes. Would you like to book one?"
            ]
        };
        
        const industryResponses = responses[this.currentIndustry] || responses.healthcare;
        return industryResponses[Math.floor(Math.random() * industryResponses.length)];
    }

    async speak(text) {
        this.isSpeaking = true;
        document.querySelector('.ai-avatar').classList.add('speaking');
        this.updateStatus('speaking', 'Speaking...');
        
        try {
            // Use Deepgram TTS API
            const response = await fetch('/api/voice-agent/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    voice: this.config.voiceModel,
                    speed: this.config.speechSpeed
                })
            });
            
            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                audio.onended = () => {
                    this.isSpeaking = false;
                    document.querySelector('.ai-avatar').classList.remove('speaking');
                    if (this.isRecording) {
                        document.querySelector('.ai-avatar').classList.add('listening');
                        this.updateStatus('active', 'Listening...');
                    } else {
                        this.updateStatus('ready', 'Ready');
                    }
                };
                
                audio.onerror = (error) => {
                    console.error('Audio playback error:', error);
                    this.isSpeaking = false;
                    document.querySelector('.ai-avatar').classList.remove('speaking');
                    this.updateStatus('ready', 'Ready');
                    this.showError('Audio playback failed. Check Deepgram API configuration.');
                };
                
                await audio.play();
                this.showSuccess('AI is speaking using Deepgram voice...');
            } else {
                throw new Error('Deepgram TTS API error');
            }
            
        } catch (error) {
            console.error('Deepgram TTS Error:', error);
            this.isSpeaking = false;
            document.querySelector('.ai-avatar').classList.remove('speaking');
            this.updateStatus('ready', 'Ready');
            this.showError('Voice synthesis requires Deepgram API configuration');
        }
    }

    toggleVoiceInput() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        
        if (voiceBtn.classList.contains('recording')) {
            // Stop recording
            this.stopVoiceInput();
        } else {
            // Start recording
            this.startVoiceInput();
        }
    }

    async startVoiceInput() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const voiceBtn = document.getElementById('voiceInputBtn');
            const statusDiv = document.getElementById('inputStatus');
            const statusText = statusDiv.querySelector('.status-text');
            
            // Update UI
            voiceBtn.classList.add('recording');
            voiceBtn.setAttribute('data-tooltip', 'Click to stop');
            voiceBtn.innerHTML = '<i class="bx bx-stop"></i>';
            
            // Show status
            statusDiv.style.display = 'flex';
            statusDiv.className = 'input-status recording';
            statusText.textContent = '🎙️ Listening... Click the red button to stop';
            
            this.mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                // Update status
                statusDiv.className = 'input-status processing';
                statusText.textContent = '⚡ Processing your speech...';
                
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const text = await this.transcribeAudio(audioBlob);
                
                if (text) {
                    document.getElementById('chatInput').value = text;
                    this.showSuccess('Speech converted to text! Click send or press Enter.');
                }
                
                // Hide status after delay
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 2000);
            };
            
            this.mediaRecorder.start();
            this.showSuccess('Microphone activated! Start speaking...');
            
        } catch (error) {
            console.error('Error starting voice input:', error);
            this.showError('Please allow microphone access to use voice input');
        }
    }

    stopVoiceInput() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.mediaRecorder = null;
        }
        
        const voiceBtn = document.getElementById('voiceInputBtn');
        voiceBtn.classList.remove('recording');
        voiceBtn.setAttribute('data-tooltip', 'Click to speak');
        voiceBtn.innerHTML = '<i class="bx bx-microphone"></i>';
    }

    async transcribeAudio(audioBlob) {
        // Send to server for Deepgram transcription
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        
        try {
            const response = await fetch('/api/voice-agent/transcribe', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.text) {
                    // Update confidence metric
                    if (data.confidence) {
                        document.getElementById('confidence').textContent = `${Math.round(data.confidence * 100)}%`;
                    }
                    if (data.language) {
                        document.getElementById('detectedLang').textContent = data.language.toUpperCase();
                    }
                    return data.text;
                }
            }
            
            throw new Error('Deepgram transcription failed');
            
        } catch (error) {
            console.error('Deepgram transcription error:', error);
            this.showError('Speech recognition requires Deepgram API configuration');
            return '';
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Add user message
        this.addUserMessage(message);
        
        // Process with AI
        this.processWithAI(message);
    }

    addUserMessage(text) {
        const container = document.getElementById('conversationContent');
        
        // Remove welcome message if exists
        const welcomeMsg = container.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message user';
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class='bx bx-user'></i>
            </div>
            <div class="message-bubble">
                <div class="message-text">${text}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
        
        // Add to history
        this.conversationHistory.push({
            role: 'user',
            content: text,
            timestamp: new Date()
        });
    }

    addAIMessage(text) {
        const container = document.getElementById('conversationContent');
        
        // Remove welcome message if exists
        const welcomeMsg = container.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message ai';
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class='bx bxs-bot'></i>
            </div>
            <div class="message-bubble">
                <div class="message-text">${text}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
        
        // Add to history
        this.conversationHistory.push({
            role: 'assistant',
            content: text,
            timestamp: new Date()
        });
    }

    showTypingIndicator() {
        const container = document.getElementById('conversationContent');
        
        const typingEl = document.createElement('div');
        typingEl.className = 'message ai typing-message';
        typingEl.innerHTML = `
            <div class="message-avatar">
                <i class='bx bxs-bot'></i>
            </div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        container.appendChild(typingEl);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        const typingEl = document.querySelector('.typing-message');
        if (typingEl) {
            typingEl.remove();
        }
    }

    loadIndustryScenarios() {
        const scenarios = {
            healthcare: [
                "I need to schedule an appointment",
                "What are your office hours?",
                "I have a toothache",
                "Do you accept my insurance?",
                "I need to cancel my appointment"
            ],
            ecommerce: [
                "Where is my order?",
                "I want to return an item",
                "Do you have this in stock?",
                "What payment methods do you accept?",
                "Can you recommend a product?"
            ],
            beauty: [
                "Book a haircut appointment",
                "What services do you offer?",
                "How much is a manicure?",
                "Do you have availability today?",
                "I need to reschedule"
            ],
            realestate: [
                "Show me available properties",
                "Schedule a viewing",
                "What's the rental process?",
                "I'm interested in buying",
                "Tell me about this neighborhood"
            ],
            financial: [
                "Check my account balance",
                "I need investment advice",
                "How do I apply for a loan?",
                "What are your interest rates?",
                "I lost my credit card"
            ],
            hospitality: [
                "Book a table for tonight",
                "What's on the menu?",
                "Do you have vegan options?",
                "I have a food allergy",
                "Can I make a reservation?"
            ],
            education: [
                "How do I enroll in a course?",
                "What programs do you offer?",
                "I need technical support",
                "When does the semester start?",
                "Can I get financial aid?"
            ],
            automotive: [
                "Schedule a service appointment",
                "I need an oil change",
                "My check engine light is on",
                "Get a repair quote",
                "Do you have this part in stock?"
            ]
        };
        
        const container = document.getElementById('scenarioGrid');
        container.innerHTML = '';
        
        const industryScenarios = scenarios[this.currentIndustry] || scenarios.healthcare;
        
        industryScenarios.forEach(scenario => {
            const btn = document.createElement('button');
            btn.className = 'scenario-btn';
            btn.textContent = scenario;
            btn.onclick = () => {
                if (this.isRecording) {
                    this.addUserMessage(scenario);
                    this.processWithAI(scenario);
                } else {
                    document.getElementById('chatInput').value = scenario;
                    this.sendChatMessage();
                }
            };
            container.appendChild(btn);
        });
    }

    getGreeting() {
        const greetings = {
            healthcare: "Hello! Welcome to our medical practice. I'm your AI assistant. How can I help you with your healthcare needs today?",
            ecommerce: "Hi there! Welcome to our online store. I'm here to help you with your shopping. What can I assist you with today?",
            beauty: "Hello and welcome! I'm your beauty salon AI assistant. How can I help make you look and feel fabulous today?",
            realestate: "Welcome! I'm your real estate AI assistant. Whether you're buying, selling, or renting, I'm here to help. What brings you here today?",
            financial: "Good day! Welcome to our financial services. I'm your AI assistant, ready to help with your banking and financial needs. How may I assist you?",
            hospitality: "Buongiorno! Welcome to our restaurant. I'm your AI host. How can I make your dining experience special today?",
            education: "Hello! Welcome to our educational institution. I'm your AI advisor, here to help with courses, enrollment, and support. What can I help you with?",
            automotive: "Welcome to our auto service center! I'm your AI service advisor. How can I help keep your vehicle running smoothly?"
        };
        
        return this.config.greetingMessage || greetings[this.currentIndustry] || greetings.healthcare;
    }

    updateGreeting() {
        if (this.conversationHistory.length === 0) {
            const greeting = this.getGreeting();
            this.addAIMessage(greeting);
        }
    }

    updateStatus(status, text) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = text;
    }

    clearConversation() {
        document.getElementById('conversationContent').innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class='bx bx-conversation'></i>
                </div>
                <h3>Welcome to VoiceAI Pro</h3>
                <p>Click "Start Conversation" or choose a test scenario to begin.</p>
                <p class="welcome-subtitle">Experience how AI can handle your customer service calls with natural, human-like conversations.</p>
            </div>
        `;
        
        this.conversationHistory = [];
    }

    exportConversation() {
        if (this.conversationHistory.length === 0) {
            this.showError('No conversation to export');
            return;
        }
        
        const exportData = {
            industry: this.currentIndustry,
            timestamp: new Date().toISOString(),
            conversation: this.conversationHistory
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    saveConfiguration() {
        localStorage.setItem('voiceAgentConfig', JSON.stringify(this.config));
        this.showSuccess('Configuration saved successfully');
    }

    restoreConfig() {
        const saved = localStorage.getItem('voiceAgentConfig');
        if (saved) {
            this.config = JSON.parse(saved);
            
            // Update UI
            document.getElementById('voiceModel').value = this.config.voiceModel;
            document.getElementById('speechSpeed').value = this.config.speechSpeed;
            document.querySelector('.slider-value').textContent = `${this.config.speechSpeed}x`;
            document.getElementById('personality').value = this.config.personality;
            document.getElementById('responseLength').value = this.config.responseLength;
            document.getElementById('customInstructions').value = this.config.customInstructions;
        }
    }

    applyCustomization() {
        this.config.companyName = document.getElementById('companyName').value;
        this.config.greetingMessage = document.getElementById('greetingMessage').value;
        
        const businessHours = document.getElementById('businessHours').value;
        const keyServices = document.getElementById('keyServices').value;
        
        // Update custom instructions with company info
        this.config.customInstructions = `
            Company: ${this.config.companyName}
            Business Hours: ${businessHours}
            Key Services: ${keyServices}
            ${this.config.customInstructions}
        `;
        
        this.saveConfiguration();
        document.getElementById('customizeModal').classList.remove('active');
        this.showSuccess('Customization applied successfully');
    }

    showAnalytics() {
        document.getElementById('analyticsModal').classList.add('active');
        this.updateCharts();
    }

    showCustomize() {
        document.getElementById('customizeModal').classList.add('active');
    }

    setupCharts() {
        // Volume Chart
        const volumeCtx = document.getElementById('volumeChart').getContext('2d');
        this.volumeChart = new Chart(volumeCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Calls',
                    data: [145, 189, 156, 203, 178, 92, 45],
                    borderColor: '#4a9eff',
                    backgroundColor: 'rgba(74, 158, 255, 0.1)',
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
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#a0a0b8' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#a0a0b8' }
                    }
                }
            }
        });

        // Resolution Chart
        const resolutionCtx = document.getElementById('resolutionChart').getContext('2d');
        this.resolutionChart = new Chart(resolutionCtx, {
            type: 'bar',
            data: {
                labels: ['Billing', 'Technical', 'Sales', 'Support', 'Other'],
                datasets: [{
                    label: 'Resolution Rate %',
                    data: [95, 88, 92, 90, 85],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(74, 158, 255, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ]
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
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#a0a0b8' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#a0a0b8' }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Update with real data if available
        if (this.volumeChart) {
            this.volumeChart.update();
        }
        if (this.resolutionChart) {
            this.resolutionChart.update();
        }
    }

    initializeWaveform() {
        // Initialize WaveSurfer for audio visualization
        this.waveform = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#4a9eff',
            progressColor: '#667eea',
            cursorColor: '#fff',
            barWidth: 3,
            barRadius: 3,
            responsive: true,
            height: 60,
            normalize: true,
            backend: 'WebAudio'
        });
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class='bx bx-error-circle'></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <i class='bx bx-check-circle'></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Toast notification styles
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: var(--dark-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    
    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .toast.success {
        border-color: #10b981;
    }
    
    .toast.success i {
        color: #10b981;
        font-size: 20px;
    }
    
    .toast.error {
        border-color: #ef4444;
    }
    
    .toast.error i {
        color: #ef4444;
        font-size: 20px;
    }
`;
document.head.appendChild(style);

// Initialize Voice Agent when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAgent = new VoiceAgent();
});