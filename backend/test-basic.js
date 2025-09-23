const axios = require('axios');

async function testBasic() {
  console.log('Testing basic AI chat endpoint...');
  
  try {
    const response = await axios.post('http://localhost:3001/api/ai-chat', {
      message: 'Hello, this is a test message'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBasic();
