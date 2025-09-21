"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only';
    return jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: '24h',
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    const secret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-for-development-only';
    return jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: '7d',
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token, secret) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map