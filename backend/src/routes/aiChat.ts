import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

// AI Chatbot service configuration
const AI_CHATBOT_URL = process.env.AI_CHATBOT_URL || 'http://127.0.0.1:5000';

// Health check for AI chatbot service
router.get('/health', async (req, res) => {
  try {
    console.log(`Attempting to connect to AI service at: ${AI_CHATBOT_URL}/api/health`);
    const response = await axios.get(`${AI_CHATBOT_URL}/api/health`, {
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
  } catch (error) {
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

// Main AI chat endpoint
router.post('/', [
  authenticateToken,
  body('message').notEmpty().trim().withMessage('Message is required'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const userId = req.user?.id || 'anonymous';

    // Forward request to AI chatbot service
    const aiResponse = await axios.post(`${AI_CHATBOT_URL}/api/chat`, {
      message: message,
      user_id: userId
    }, {
      timeout: 30000 // 30 second timeout for AI responses
    });

    const responseData = aiResponse.data as any;

    res.json({
      reply: responseData.response,
      type: responseData.type,
      timestamp: responseData.timestamp,
      responseTime: responseData.response_time,
      isAI: true
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Fallback response if AI service is unavailable
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

// Streaming AI chat endpoint
router.post('/stream', [
  // authenticateToken, // Temporarily disabled for testing
  body('message').notEmpty().trim().withMessage('Message is required'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const userId = req.user?.id || 'anonymous';

    // Set up Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    try {
      console.log(`Forwarding streaming request to AI service: ${AI_CHATBOT_URL}/api/chat/stream`);
      
      // Forward streaming request to AI chatbot service
      const aiResponse = await axios.post(`${AI_CHATBOT_URL}/api/chat/stream`, {
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

      const stream = aiResponse.data as any;

      // Pipe the AI service response to the client
      stream.on('data', (chunk: Buffer) => {
        console.log('Received chunk from AI service:', chunk.toString());
        res.write(chunk);
      });

      stream.on('end', () => {
        console.log('AI service stream ended');
        res.end();
      });

      stream.on('error', (error: Error) => {
        console.error('AI streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Streaming error', done: true })}\n\n`);
        res.end();
      });

    } catch (aiError) {
      console.error('AI service error:', aiError);
      
      // Send fallback streaming response
      const fallbackMessage = "I'm experiencing some technical difficulties with my AI model, but I'm still here to help. How are you feeling today?";
      
      res.write(`data: ${JSON.stringify({ content: fallbackMessage, done: true })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('AI Chat streaming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear conversation history
router.post('/clear', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || 'anonymous';
    
    // Clear conversation on AI service
    await axios.post(`${AI_CHATBOT_URL}/api/clear`, {
      user_id: userId
    }, {
      timeout: 5000
    });

    res.json({
      message: 'Conversation cleared successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

// Get AI service status
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${AI_CHATBOT_URL}/api/status`, {
      timeout: 5000
    });
    
    res.json({
      aiService: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI service status check failed:', error);
    res.status(503).json({
      error: 'AI service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
