"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendBookingNotification = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: false,
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        } : undefined,
    });
};
const sendBookingNotification = async (counsellorEmail, studentName, slotStart, slotEnd) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@psychological-intervention.com',
        to: counsellorEmail,
        subject: 'New Booking Request - Psychological Intervention Platform',
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
        <p>Best regards,<br>Psychological Intervention Platform</p>
      </div>
    `,
    };
    await transporter.sendMail(mailOptions);
};
exports.sendBookingNotification = sendBookingNotification;
const sendWelcomeEmail = async (userEmail, userName) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@psychological-intervention.com',
        to: userEmail,
        subject: 'Welcome to Psychological Intervention Platform',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome, ${userName}!</h2>
        <p>Thank you for joining our psychological intervention platform. We're here to support your mental health journey.</p>
        <p>You can now:</p>
        <ul>
          <li>Book appointments with qualified counsellors</li>
          <li>Take mental health screenings</li>
          <li>Access helpful resources</li>
          <li>Chat with our support system</li>
        </ul>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br>Psychological Intervention Platform Team</p>
      </div>
    `,
    };
    await transporter.sendMail(mailOptions);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
//# sourceMappingURL=email.js.map