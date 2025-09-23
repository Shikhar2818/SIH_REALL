/**
 * Test script to check email delivery to different addresses
 */

const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function testEmailDelivery() {
    console.log('📧 Testing Email Delivery to Different Addresses');
    console.log('=' * 60);
    
    const testEmails = [
        {
            name: 'Verified Sender Test',
            email: process.env.SENDGRID_FROM_EMAIL, // Your verified email
            description: 'Same as verified sender (should work)'
        },
        {
            name: 'Gmail Test',
            email: 'test@gmail.com',
            description: 'Different Gmail address'
        },
        {
            name: 'Other Email Test',
            email: 'test@example.com',
            description: 'Example email address'
        }
    ];
    
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    
    console.log('📤 Sending from:', fromEmail);
    console.log('');
    
    for (const test of testEmails) {
        console.log(`🧪 Testing: ${test.description}`);
        console.log(`   To: ${test.email}`);
        
        const msg = {
            to: test.email,
            from: fromEmail,
            subject: `Test Email Delivery - ${test.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Email Delivery Test</h2>
                    <p>This is a test email to verify delivery to different addresses.</p>
                    <p><strong>Test Details:</strong></p>
                    <ul>
                        <li>From: ${fromEmail}</li>
                        <li>To: ${test.email}</li>
                        <li>Test: ${test.description}</li>
                        <li>Timestamp: ${new Date().toISOString()}</li>
                    </ul>
                    <p>If you receive this email, delivery to this address works!</p>
                </div>
            `
        };
        
        try {
            const response = await sgMail.send(msg);
            console.log(`   ✅ Success! Status: ${response[0].statusCode}`);
            console.log(`   📧 Message ID: ${response[0].headers['x-message-id']}`);
            
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            
            if (error.response && error.response.body && error.response.body.errors) {
                error.response.body.errors.forEach(err => {
                    console.log(`   🔍 Error: ${err.message}`);
                    
                    // Provide specific solutions
                    if (err.message.includes('sender authentication')) {
                        console.log('   💡 Solution: Verify sender authentication in SendGrid');
                    }
                    if (err.message.includes('domain authentication')) {
                        console.log('   💡 Solution: Set up domain authentication in SendGrid');
                    }
                    if (err.message.includes('recipient')) {
                        console.log('   💡 Solution: This email address might be blocked or invalid');
                    }
                });
            }
        }
        
        console.log('');
    }
    
    console.log('📋 Solutions for Email Delivery Issues:');
    console.log('');
    console.log('1. 🔐 Sender Authentication:');
    console.log('   - Go to: https://app.sendgrid.com/settings/sender_auth');
    console.log('   - Verify your single sender email');
    console.log('   - Or set up domain authentication for your domain');
    console.log('');
    console.log('2. 🌐 Domain Authentication (Recommended):');
    console.log('   - Go to: https://app.sendgrid.com/settings/sender_auth');
    console.log('   - Click "Authenticate Your Domain"');
    console.log('   - Follow the DNS setup instructions');
    console.log('   - This allows sending from any email on your domain');
    console.log('');
    console.log('3. 📧 Single Sender Verification:');
    console.log('   - Currently you can only send from: ' + fromEmail);
    console.log('   - To send from other emails, verify them individually');
    console.log('');
    console.log('4. 🚫 Email Blocking:');
    console.log('   - Some email providers block emails from unverified domains');
    console.log('   - Gmail, Yahoo, etc. might filter emails as spam');
    console.log('   - Check spam folders in recipient emails');
    console.log('');
    console.log('🔍 Check SendGrid Activity Feed:');
    console.log('https://app.sendgrid.com/email_activity');
}

testEmailDelivery().catch(console.error);
