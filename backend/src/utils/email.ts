import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: false,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });
};

export const sendBookingNotification = async (
  counsellorEmail: string,
  studentName: string,
  slotStart: Date,
  slotEnd: Date
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@psychological-intervention.com',
    to: counsellorEmail,
    subject: 'New Booking Request - Rapy Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Booking Request</h2>
        <p>Hello,</p>
        <p>A new booking request has been made by a student:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Date & Time:</strong> ${slotStart.toLocaleString()}</p>
          <p><strong>Duration:</strong> ${Math.round((slotEnd.getTime() - slotStart.getTime()) / (1000 * 60))} minutes</p>
        </div>
        <p>Please log in to your dashboard to confirm or manage this booking.</p>
        <p>Best regards,<br>Rapy Platform</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@psychological-intervention.com',
    to: userEmail,
    subject: 'Welcome to Rapy Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome, ${userName}!</h2>
        <p>Thank you for joining Rapy! We're here to support your mental health journey.</p>
        <p>You can now:</p>
        <ul>
          <li>Book appointments with qualified counsellors</li>
          <li>Take mental health screenings</li>
          <li>Access helpful resources</li>
          <li>Chat with our support system</li>
        </ul>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br>Rapy Platform Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendCredentialsEmail = async (
  userEmail: string,
  userName: string,
  username: string,
  password: string
): Promise<void> => {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rapy.com';
  
  const msg = {
    to: userEmail,
    from: fromEmail,
    subject: 'Your Rapy Platform Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Rapy Platform</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Mental Health Support Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your account has been created successfully. Below are your login credentials:
          </p>
          
          <div style="background: white; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0; font-size: 18px;">🔐 Your Login Credentials</h3>
            <div style="margin: 15px 0;">
              <p style="margin: 8px 0; font-size: 16px;">
                <strong style="color: #495057;">Username:</strong> 
                <span style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #495057;">${username}</span>
              </p>
              <p style="margin: 8px 0; font-size: 16px;">
                <strong style="color: #495057;">Password:</strong> 
                <span style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #495057;">${password}</span>
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
          
          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">🎯 What you can do on Rapy:</h4>
            <ul style="color: #1976d2; margin: 0; padding-left: 20px;">
              <li>Book appointments with qualified counsellors</li>
              <li>Take mental health screenings</li>
              <li>Access helpful resources and articles</li>
              <li>Chat with our AI mental health assistant</li>
              <li>Join community forums for peer support</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 30px 0 0 0;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
            Best regards,<br>
            <strong>The Rapy Platform Team</strong>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Credentials email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw error;
  }
};