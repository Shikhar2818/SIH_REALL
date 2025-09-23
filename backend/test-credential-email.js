/**
 * Test script to debug credential email generation
 */

const sgMail = require('@sendgrid/mail');
const axios = require('axios');
require('dotenv').config();

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function testCredentialEmail() {
    console.log('🔐 Testing Credential Email Generation');
    console.log('=' * 50);
    
    const testUser = {
        name: 'Email Test User',
        email: process.env.SENDGRID_FROM_EMAIL, // Send to yourself
        rollNumber: 'TEST123',
        collegeId: 'TEST001',
        consent: true
    };
    
    console.log('📝 Test User Data:');
    console.log('Name:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Roll Number:', testUser.rollNumber);
    console.log('College ID:', testUser.collegeId);
    console.log('Consent:', testUser.consent);
    
    // Test the backend API
    console.log('\n🌐 Testing Backend API...');
    try {
        const response = await axios.post('http://localhost:3001/api/credentials/generate', testUser, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ Backend API Response:');
        console.log('Status:', response.status);
        console.log('Message:', response.data.message);
        console.log('Email:', response.data.email);
        console.log('Username:', response.data.username);
        console.log('Success:', response.data.success);
        
        // Check if email was actually sent
        console.log('\n📧 Checking if email was sent...');
        console.log('If you received the credential email, the system is working!');
        console.log('If not, there might be an issue with the email sending process.');
        
    } catch (error) {
        console.log('❌ Backend API Error:');
        console.log('Message:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
    
    // Test direct email sending
    console.log('\n📤 Testing Direct Email Sending...');
    
    const credentialEmail = {
        to: process.env.SENDGRID_FROM_EMAIL,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Direct Test - Your Rapy Platform Credentials',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Rapy Platform</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Mental Health Support Platform</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Hello ${testUser.name}!</h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Your account has been created successfully. Below are your login credentials:
                    </p>
                    
                    <div style="background: white; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #495057; margin-top: 0; font-size: 18px;">🔐 Your Login Credentials</h3>
                        <div style="margin: 15px 0;">
                            <p style="margin: 8px 0; font-size: 16px;">
                                <strong style="color: #495057;">Username:</strong> 
                                <span style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #495057;">testuser123</span>
                            </p>
                            <p style="margin: 8px 0; font-size: 16px;">
                                <strong style="color: #495057;">Password:</strong> 
                                <span style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #495057;">TempPass123!</span>
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <h4 style="color: #155724; margin: 0 0 10px 0;">⚠️ Important Security Notice</h4>
                        <p style="color: #155724; margin: 0; font-size: 14px;">
                            Please change your password after your first login for security purposes.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                           style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Login to Your Account
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin: 30px 0 0 0;">
                        This is a direct test email to verify the credential email template works.
                    </p>
                </div>
            </div>
        `
    };
    
    try {
        const emailResponse = await sgMail.send(credentialEmail);
        console.log('✅ Direct credential email sent successfully!');
        console.log('Status:', emailResponse[0].statusCode);
        console.log('Message ID:', emailResponse[0].headers['x-message-id']);
        
        console.log('\n📋 Summary:');
        console.log('1. Backend API: ' + (error ? '❌ Failed' : '✅ Working'));
        console.log('2. Direct Email: ✅ Working');
        console.log('3. Check your email for both messages');
        
    } catch (error) {
        console.log('❌ Direct email error:', error.message);
        if (error.response) {
            console.log('Error details:', error.response.body);
        }
    }
    
    console.log('\n🔍 Troubleshooting Tips:');
    console.log('1. Check spam folder');
    console.log('2. Verify sender authentication in SendGrid');
    console.log('3. Check SendGrid activity feed');
    console.log('4. Look at backend console logs for errors');
}

testCredentialEmail().catch(console.error);
