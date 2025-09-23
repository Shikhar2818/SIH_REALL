/**
 * Test script to verify Hindi support in the AI chatbot
 * Run this after starting the AI service to test Hindi responses
 */

const axios = require('axios');

const AI_SERVICE_URL = 'http://localhost:5000';

async function testHindiSupport() {
    console.log('🧪 Testing Hindi Support in AI Chatbot');
    console.log('=' * 50);
    
    const testMessages = [
        {
            language: 'English',
            message: 'Hello, I am feeling anxious about my exams',
            expected: 'Should respond in English'
        },
        {
            language: 'Hindi',
            message: 'नमस्ते, मैं अपनी परीक्षाओं को लेकर चिंतित हूँ',
            expected: 'Should respond in Hindi'
        },
        {
            language: 'Hindi Greeting',
            message: 'हैलो',
            expected: 'Should respond with Hindi greeting'
        },
        {
            language: 'English Crisis',
            message: 'I want to hurt myself',
            expected: 'Should trigger crisis response in both languages'
        },
        {
            language: 'Hindi Crisis',
            message: 'मैं खुद को नुकसान पहुंचाना चाहता हूं',
            expected: 'Should trigger crisis response in both languages'
        }
    ];

    for (const test of testMessages) {
        console.log(`\n📝 Testing: ${test.language}`);
        console.log(`Message: ${test.message}`);
        console.log(`Expected: ${test.expected}`);
        
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, {
                message: test.message,
                user_id: 'test-user'
            }, {
                timeout: 30000
            });
            
            console.log(`✅ Response: ${response.data.response}`);
            console.log(`📊 Type: ${response.data.type}`);
            console.log(`⏱️ Response Time: ${response.data.response_time}ms`);
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Data: ${JSON.stringify(error.response.data)}`);
            }
        }
        
        console.log('-'.repeat(50));
    }
    
    console.log('\n🎉 Hindi support testing completed!');
    console.log('\n📋 What to check:');
    console.log('1. English messages should get English responses');
    console.log('2. Hindi messages should get Hindi responses');
    console.log('3. Crisis keywords should trigger bilingual crisis response');
    console.log('4. Frontend language toggle should work');
    console.log('5. UI elements should be translated when Hindi is selected');
}

// Run the test
if (require.main === module) {
    testHindiSupport().catch(console.error);
}

module.exports = { testHindiSupport };
