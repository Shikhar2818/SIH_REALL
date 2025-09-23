"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
const AI_CHATBOT_URL = process.env.AI_CHATBOT_URL || 'http://127.0.0.1:5000';
router.get('/health', async (req, res) => {
    try {
        console.log(`Attempting to connect to AI service at: ${AI_CHATBOT_URL}/api/health`);
        const response = await axios_1.default.get(`${AI_CHATBOT_URL}/api/health`, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log('AI Service response:', response.data);
        res.json({
            status: 'healthy',
            aiService: response.data,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('AI Chatbot health check failed:', error.message);
        console.error('Error details:', error.response?.data || error.code);
        res.status(503).json({
            status: 'unhealthy',
            error: 'AI Chatbot service unavailable',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
router.post('/', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('message').notEmpty().trim().withMessage('Message is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { message } = req.body;
        const userId = req.user?.id || 'anonymous';
        const aiResponse = await axios_1.default.post(`${AI_CHATBOT_URL}/api/chat`, {
            message: message,
            user_id: userId
        }, {
            timeout: 30000
        });
        const responseData = aiResponse.data;
        res.json({
            reply: responseData.response,
            type: responseData.type,
            timestamp: responseData.timestamp,
            responseTime: responseData.response_time,
            isAI: true
        });
    }
    catch (error) {
        console.error('AI Chat error:', error);
        const fallbackResponse = "I'm experiencing some technical difficulties with my AI model, but I'm still here to help. How are you feeling today?";
        res.json({
            reply: fallbackResponse,
            type: 'fallback',
            timestamp: new Date().toISOString(),
            responseTime: 0,
            isAI: false,
            error: 'AI service temporarily unavailable'
        });
    }
});
router.post('/stream', [
    (0, express_validator_1.body)('message').notEmpty().trim().withMessage('Message is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { message } = req.body;
        const userId = req.user?.id || 'anonymous';
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
        });
        try {
            console.log(`Forwarding streaming request to AI service: ${AI_CHATBOT_URL}/api/chat/stream`);
            const aiResponse = await axios_1.default.post(`${AI_CHATBOT_URL}/api/chat/stream`, {
                message: message,
                user_id: userId
            }, {
                timeout: 30000,
                responseType: 'stream',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                }
            });
            const stream = aiResponse.data;
            stream.on('data', (chunk) => {
                console.log('Received chunk from AI service:', chunk.toString());
                res.write(chunk);
            });
            stream.on('end', () => {
                console.log('AI service stream ended');
                res.end();
            });
            stream.on('error', (error) => {
                console.error('AI streaming error:', error);
                res.write(`data: ${JSON.stringify({ error: 'Streaming error', done: true })}\n\n`);
                res.end();
            });
        }
        catch (aiError) {
            console.error('AI service error:', aiError);
            const fallbackMessage = "I'm experiencing some technical difficulties with my AI model, but I'm still here to help. How are you feeling today?";
            res.write(`data: ${JSON.stringify({ content: fallbackMessage, done: true })}\n\n`);
            res.end();
        }
    }
    catch (error) {
        console.error('AI Chat streaming error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/clear', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id || 'anonymous';
        await axios_1.default.post(`${AI_CHATBOT_URL}/api/clear`, {
            user_id: userId
        }, {
            timeout: 5000
        });
        res.json({
            message: 'Conversation cleared successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Clear conversation error:', error);
        res.status(500).json({ error: 'Failed to clear conversation' });
    }
});
router.get('/status', async (req, res) => {
    try {
        const response = await axios_1.default.get(`${AI_CHATBOT_URL}/api/status`, {
            timeout: 5000
        });
        res.json({
            aiService: response.data,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('AI service status check failed:', error);
        res.status(503).json({
            error: 'AI service unavailable',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=aiChat.js.map