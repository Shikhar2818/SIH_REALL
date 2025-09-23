const axios = require('axios');

async function testConnection() {
  console.log('Testing Backend to AI Service Connection...');
  console.log('==========================================');
  
  try {
    console.log('1. Testing direct connection to AI service...');
    const aiResponse = await axios.get('http://localhost:5000/api/health', {
      timeout: 5000
    });
    console.log('✅ AI Service Response:', aiResponse.data);
  } catch (error) {
    console.log('❌ AI Service Connection Failed:', error.message);
  }
  
  try {
    console.log('\n2. Testing backend AI integration...');
    const backendResponse = await axios.get('http://localhost:3001/api/ai-chat/health', {
      timeout: 5000
    });
    console.log('✅ Backend AI Integration Response:', backendResponse.data);
  } catch (error) {
    console.log('❌ Backend AI Integration Failed:', error.message);
    console.log('Error details:', error.response?.data || error.message);
  }
  
  try {
    console.log('\n3. Testing AI chat endpoint...');
    const chatResponse = await axios.post('http://localhost:5000/api/chat', {
      message: 'Hello, this is a test',
      user_id: 'test_user'
    }, {
      timeout: 10000
    });
    console.log('✅ AI Chat Response:', chatResponse.data);
  } catch (error) {
    console.log('❌ AI Chat Failed:', error.message);
    console.log('Error details:', error.response?.data || error.message);
  }
}

testConnection().catch(console.error);
