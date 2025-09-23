/**
 * Test script for the new credential generation system
 * Run this after starting the backend to test the new system
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testCredentialSystem() {
    console.log('🧪 Testing Credential Generation System');
    console.log('=' * 50);
    
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        rollNumber: 'TEST123',
        collegeId: 'COLLEGE001',
        consent: true
    };

    console.log('📝 Testing credential generation...');
    console.log(`User: ${testUser.name} (${testUser.email})`);
    
    try {
        const response = await axios.post(`${API_URL}/api/credentials/generate`, testUser, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ Credential generation successful!');
        console.log(`📧 Email: ${response.data.email}`);
        console.log(`👤 Username: ${response.data.username}`);
        console.log(`📨 Message: ${response.data.message}`);
        
        // Test duplicate email
        console.log('\n🔄 Testing duplicate email prevention...');
        try {
            await axios.post(`${API_URL}/api/credentials/generate`, testUser, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log('❌ Duplicate email should have been rejected');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Duplicate email correctly rejected');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Credential generation failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
    
    console.log('\n📋 What to check:');
    console.log('1. Check your email for the credential email');
    console.log('2. Verify the email contains username and password');
    console.log('3. Test login with the provided credentials');
    console.log('4. Check SendGrid dashboard for delivery status');
    
    console.log('\n🎉 Credential system testing completed!');
}

// Test validation
async function testValidation() {
    console.log('\n🧪 Testing Form Validation');
    console.log('=' * 30);
    
    const invalidUsers = [
        {
            name: 'A', // Too short
            email: 'invalid-email',
            consent: false
        },
        {
            name: 'Valid Name',
            email: 'test@example.com',
            consent: false // No consent
        }
    ];
    
    for (const user of invalidUsers) {
        console.log(`\n📝 Testing invalid user: ${user.name}`);
        try {
            await axios.post(`${API_URL}/api/credentials/generate`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log('❌ Validation should have failed');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Validation correctly failed');
                console.log('Errors:', error.response.data.errors);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
    }
}

// Run the tests
if (require.main === module) {
    testCredentialSystem()
        .then(() => testValidation())
        .catch(console.error);
}

module.exports = { testCredentialSystem, testValidation };



