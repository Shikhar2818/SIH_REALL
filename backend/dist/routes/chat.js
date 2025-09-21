"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const mockResponses = {
    stress: [
        "I understand you're feeling stressed. It's completely normal to feel this way. Have you tried any relaxation techniques like deep breathing or meditation?",
        "Stress can be overwhelming, but remember that you're not alone. Consider talking to a counsellor about what's causing your stress.",
        "It sounds like you're going through a difficult time. Would you like to book an appointment with one of our counsellors to discuss this further?",
    ],
    anxiety: [
        "Anxiety can feel very intense, but there are ways to manage it. Try focusing on your breathing and grounding techniques.",
        "I hear that you're experiencing anxiety. This is a common feeling, and it's okay to seek help. Our counsellors are trained to help with anxiety.",
        "Anxiety can be challenging to deal with alone. Consider taking one of our mental health screenings to better understand your symptoms.",
    ],
    depression: [
        "I'm sorry you're feeling this way. Depression can be very difficult to cope with, but there is hope and help available.",
        "It takes courage to talk about depression. Our counsellors are here to support you through this difficult time.",
        "If you're having thoughts of self-harm, please reach out to a mental health professional immediately. You can also contact emergency services.",
    ],
    general: [
        "Thank you for sharing that with me. I'm here to listen and support you.",
        "I understand this is important to you. Would you like to explore some resources or speak with a counsellor?",
        "It sounds like you're going through a lot. Remember that seeking help is a sign of strength, not weakness.",
        "I'm here to support you. Our platform offers various resources and professional counselling services.",
    ],
};
const getMockResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('stress') || lowerMessage.includes('stressed')) {
        return mockResponses.stress[Math.floor(Math.random() * mockResponses.stress.length)];
    }
    if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
        return mockResponses.anxiety[Math.floor(Math.random() * mockResponses.anxiety.length)];
    }
    if (lowerMessage.includes('depress') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
        return mockResponses.depression[Math.floor(Math.random() * mockResponses.depression.length)];
    }
    return mockResponses.general[Math.floor(Math.random() * mockResponses.general.length)];
};
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
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        const reply = getMockResponse(message);
        res.json({
            reply,
            timestamp: new Date().toISOString(),
            isMock: true,
            note: "This is a mock response. Real chatbot integration will be implemented later.",
        });
    }
    catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/history', auth_1.authenticateToken, async (req, res) => {
    try {
        res.json({ messages: [] });
    }
    catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map