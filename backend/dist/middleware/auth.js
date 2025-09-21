"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStudent = exports.requireCounsellor = exports.requireAdmin = exports.requireRole = exports.authenticateRefreshToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.default.findById(decoded.userId).select('-hashedPassword');
        if (!user) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
            return;
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(403).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
            return;
        }
        res.status(403).json({ error: 'Authentication failed' });
    }
};
exports.authenticateToken = authenticateToken;
const authenticateRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token required' });
            return;
        }
        const secret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-for-development-only';
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = await User_1.default.findById(decoded.userId).select('-hashedPassword');
        if (!user) {
            res.status(401).json({ error: 'Invalid refresh token' });
            return;
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
exports.authenticateRefreshToken = authenticateRefreshToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(['admin']);
exports.requireCounsellor = (0, exports.requireRole)(['counsellor', 'admin']);
exports.requireStudent = (0, exports.requireRole)(['student', 'admin']);
//# sourceMappingURL=auth.js.map