/**
 * Test script to debug SendGrid email delivery
 */

const sgMail = require('@sendgrid/mail');
require('dotenv').config();

async function testSendGrid() {
    console.log('📧 Testing SendGrid Email Delivery');
    console.log('=' * 50);
    
    // Check configuration
    console.log('🔧 Configuration Check:');
    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Not set');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Not set');
    
    if (!process.env.SENDGRID_API_KEY) {
        console.log('❌ SENDGRID_API_KEY is not set in .env file');
        return;
    }
    
    if (!process.env.SENDGRID_FROM_EMAIL) {
        console.log('❌ SENDGRID_FROM_EMAIL is not set in .env file');
        return;
    }
    
    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Test email
    const testEmail = {
        to: process.env.SENDGRID_FROM_EMAIL, // Send to yourself for testing
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'SendGrid Test - Rapy Platform',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">SendGrid Test Email</h2>
                <p>This is a test email to verify SendGrid configuration.</p>
                <p><strong>Test Details:</strong></p>
                <ul>
                    <li>API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...</li>
                    <li>From Email: ${process.env.SENDGRID_FROM_EMAIL}</li>
                    <li>Timestamp: ${new Date().toISOString()}</li>
                </ul>
                <p>If you receive this email, SendGrid is working correctly!</p>
            </div>
        `
    };
    
    console.log('\n📤 Sending test email...');
    console.log('To:', testEmail.to);
    console.log('From:', testEmail.from);
    
    try {
        const response = await sgMail.send(testEmail);
        console.log('✅ Test email sent successfully!');
        console.log('Response:', response[0].statusCode);
        console.log('Message ID:', response[0].headers['x-message-id']);
        
        console.log('\n📋 Next Steps:');
        console.log('1. Check your email inbox: ' + process.env.SENDGRID_FROM_EMAIL);
        console.log('2. Check spam/junk folder');
        console.log('3. Verify sender authentication in SendGrid dashboard');
        console.log('4. Check SendGrid activity feed for delivery status');
        
    } catch (error) {
        console.log('❌ SendGrid error:', error.message);
        
        if (error.response) {
            console.log('Error details:', error.response.body);
            
            // Common SendGrid errors
            if (error.response.body.errors) {
                error.response.body.errors.forEach(err => {
                    console.log(`- ${err.message}`);
                    
                    // Provide specific solutions
                    if (err.message.includes('sender authentication')) {
                        console.log('  💡 Solution: Verify your sender email in SendGrid dashboard');
                        console.log('  📍 Go to: Settings > Sender Authentication');
                    }
                    if (err.message.includes('API key')) {
                        console.log('  💡 Solution: Check your API key and permissions');
                        console.log('  📍 Go to: Settings > API Keys');
                    }
                    if (err.message.includes('from address')) {
                        console.log('  💡 Solution: Use a verified sender email address');
                    }
                });
            }
        }
    }
    
    console.log('\n🔍 SendGrid Dashboard Links:');
    console.log('- Activity Feed: https://app.sendgrid.com/email_activity');
    console.log('- Sender Authentication: https://app.sendgrid.com/settings/sender_auth');
    console.log('- API Keys: https://app.sendgrid.com/settings/api_keys');
}

testSendGrid().catch(console.error);



