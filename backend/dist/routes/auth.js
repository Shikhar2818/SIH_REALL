"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('rollNumber').optional().trim(),
    (0, express_validator_1.body)('collegeId').optional().trim(),
    (0, express_validator_1.body)('consent').isBoolean().withMessage('Consent must be provided'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, rollNumber, collegeId, consent } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = new User_1.default({
            name,
            email,
            hashedPassword,
            rollNumber,
            collegeId,
            consent,
        });
        await user.save();
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        try {
            await (0, email_1.sendWelcomeEmail)(email, name);
        }
        catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                collegeId: user.collegeId,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user || !user.hashedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.hashedPassword);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                collegeId: user.collegeId,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/google/url', (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback')}&` +
        `scope=profile email&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
    res.json({ authUrl });
});
router.post('/google/callback', [
    (0, express_validator_1.body)('code').notEmpty().withMessage('Authorization code required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { code, rollNumber, collegeId, consent } = req.body;
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
            }),
        });
        const tokens = await tokenResponse.json();
        if (!tokens.access_token) {
            return res.status(400).json({ error: 'Failed to get access token' });
        }
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });
        const googleUser = await userResponse.json();
        let user = await User_1.default.findOne({ email: googleUser.email });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleUser.id;
                await user.save();
            }
        }
        else {
            user = new User_1.default({
                name: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.id,
                rollNumber,
                collegeId,
                consent: consent === true,
            });
            await user.save();
            try {
                await (0, email_1.sendWelcomeEmail)(googleUser.email, googleUser.name);
            }
            catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        res.json({
            message: 'Google login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                collegeId: user.collegeId,
            },
        });
    }
    catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/refresh', [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { refreshToken } = req.body;
        const secret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-for-development-only';
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('-hashedPassword');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                collegeId: user.collegeId,
            },
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map