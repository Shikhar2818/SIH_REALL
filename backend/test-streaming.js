const axios = require('axios');

async function testStreaming() {
  console.log('Testing streaming endpoint...');
  
  try {
    const response = await axios.post('http://localhost:3001/api/ai-chat/stream', {
      message: 'Hello, this is a test message'
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      responseType: 'stream',
      timeout: 10000
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    response.data.on('data', (chunk) => {
      console.log('Received chunk:', chunk.toString());
    });
    
    response.data.on('end', () => {
      console.log('Stream ended');
    });
    
    response.data.on('error', (error) => {
      console.error('Stream error:', error);
    });
    
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testStreaming();
