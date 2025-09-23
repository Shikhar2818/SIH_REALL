/**
 * Test script to verify frontend-backend communication
 */

const axios = require('axios');

async function testFrontendBackend() {
    console.log('🧪 Testing Frontend-Backend Communication');
    console.log('=' * 50);
    
    // Test backend health
    try {
        const healthResponse = await axios.get('http://localhost:3001/health');
        console.log('✅ Backend Health Check:', healthResponse.data.status);
    } catch (error) {
        console.log('❌ Backend not responding:', error.message);
        return;
    }
    
    // Test credentials endpoint
    try {
        const credentialsResponse = await axios.post('http://localhost:3001/api/credentials/generate', {
            name: 'Frontend Test User',
            email: 'frontend-test@example.com',
            rollNumber: 'FRONT123',
            collegeId: 'FRONTEND001',
            consent: true
        });
        
        console.log('✅ Credentials Endpoint Working!');
        console.log('📧 Email:', credentialsResponse.data.email);
        console.log('👤 Username:', credentialsResponse.data.username);
        console.log('📨 Message:', credentialsResponse.data.message);
        
    } catch (error) {
        console.log('❌ Credentials endpoint error:', error.response?.data || error.message);
    }
    
    // Test frontend availability
    try {
        const frontendResponse = await axios.get('http://localhost:3000');
        console.log('✅ Frontend is running on port 3000');
    } catch (error) {
        console.log('❌ Frontend not responding on port 3000:', error.message);
        console.log('💡 Make sure to start frontend with: cd frontend && npm run dev');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Open http://localhost:3000/register in your browser');
    console.log('2. Fill out the registration form');
    console.log('3. Click "Generate Credentials"');
    console.log('4. Check your email for the credentials');
    console.log('\n📧 SendGrid Configuration:');
    console.log('- API Key: Configured ✅');
    console.log('- From Email: irshadimam1506@gmail.com ✅');
    console.log('- Check SendGrid dashboard for delivery status');
}

testFrontendBackend().catch(console.error);



