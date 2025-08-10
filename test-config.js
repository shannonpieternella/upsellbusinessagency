const WebSocket = require('ws');
require('dotenv').config();

async function testConfiguration() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    console.log('Testing Voice Agent V1 Configuration...\n');
    console.log('Deepgram API Key:', apiKey ? '✓ Found' : '✗ Missing');
    console.log('OpenAI API Key:', openaiKey ? '✓ Found' : '✗ Missing');
    console.log('\nConnecting to Deepgram Voice Agent V1...\n');
    
    const url = 'wss://agent.deepgram.com/v1/agent/converse';
    
    const ws = new WebSocket(url, {
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    ws.on('open', () => {
        console.log('✅ Connected to Voice Agent\n');
        
        // Test configuration 1: With api_key in provider
        const settings1 = {
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
                        type: 'deepgram',
                        model: 'base'
                    },
                    prompt: 'You are a helpful AI assistant for a healthcare practice. Be professional and empathetic.'
                },
                speak: {
                    provider: {
                        type: 'deepgram',
                        model: 'aura-asteria-en'
                    }
                },
                language: 'en'
            }
        };
        
        console.log('📤 Sending test configuration...\n');
        console.log('Provider type: "deepgram" (using Deepgram LLM)');
        console.log('Model: "base"');
        console.log('Note: Using Deepgram\'s built-in LLM instead of OpenAI\n');
        
        ws.send(JSON.stringify(settings1));
    });
    
    ws.on('message', (data) => {
        // Check if it's binary audio data
        if (Buffer.isBuffer(data) && data.length > 4) {
            const header = data.slice(0, 4).toString('utf8');
            if (header === 'RIFF' || data[0] === 0x52) {
                return; // Skip audio data
            }
        }
        
        let message;
        try {
            message = JSON.parse(data.toString());
        } catch (e) {
            return; // Skip binary data
        }
        
        console.log(`📨 ${message.type}`);
        
        switch (message.type) {
            case 'Welcome':
                console.log('  ✓ Connected successfully');
                break;
                
            case 'SettingsApplied':
                console.log('  ✅ Configuration is VALID!\n');
                console.log('SUCCESS: The configuration works correctly!');
                setTimeout(() => {
                    ws.close();
                    process.exit(0);
                }, 1000);
                break;
                
            case 'Error':
                console.error('  ❌ Configuration ERROR:');
                console.error('  Code:', message.code);
                console.error('  Description:', message.description);
                console.error('\nThe configuration format is incorrect.');
                ws.close();
                process.exit(1);
                break;
                
            case 'Warning':
                console.warn('  ⚠️ Warning:', message.description);
                break;
        }
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        process.exit(1);
    });
    
    ws.on('close', () => {
        console.log('\n🔌 Connection closed');
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
        console.error('\n❌ Timeout - no response received');
        ws.close();
        process.exit(1);
    }, 10000);
}

testConfiguration();