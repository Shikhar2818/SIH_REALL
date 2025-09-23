import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { sendCredentialsEmail } from '../utils/email';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const router = express.Router();

// Generate credentials for a user
router.post('/generate', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('rollNumber').optional().trim(),
  body('collegeId').optional().trim(),
  body('consent').isBoolean().withMessage('Consent must be provided'),
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, rollNumber, collegeId, consent } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate username (email prefix + random number)
    const emailPrefix = email.split('@')[0];
    const randomSuffix = Math.floor(Math.random() * 1000);
    const username = `${emailPrefix}${randomSuffix}`;

    // Generate secure password
    const password = generateSecurePassword();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      username,
      hashedPassword,
      rollNumber,
      collegeId,
      consent,
    });

    await user.save();

    // Send credentials email
    try {
      await sendCredentialsEmail(email, name, username, password);
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      message: 'Credentials generated successfully. Please check your email for login details.',
      success: true,
      email: email,
      username: username,
    });

  } catch (error) {
    console.error('Credential generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate secure password
function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default router;



