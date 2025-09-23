const http = require('http');

function testStreaming() {
  console.log('Testing streaming endpoint with simple HTTP...');
  
  const postData = JSON.stringify({
    message: 'Hello, this is a test message'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/ai-chat/stream',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    
    res.on('data', (chunk) => {
      console.log('Received chunk:', chunk.toString());
    });
    
    res.on('end', () => {
      console.log('Stream ended');
    });
    
    res.on('error', (error) => {
      console.error('Stream error:', error);
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  req.write(postData);
  req.end();
  
  // Set a timeout
  setTimeout(() => {
    console.log('Request timed out after 5 seconds');
    req.destroy();
  }, 5000);
}

testStreaming();
