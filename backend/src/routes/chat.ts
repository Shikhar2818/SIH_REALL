import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Comprehensive responses for different types of messages and platform features
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
  booking: [
    "To book an appointment, go to the 'Bookings' section in your dashboard. You can choose from available counsellors and select a convenient time slot.",
    "I can help you book a counselling session! Navigate to the Bookings page where you'll find our qualified counsellors and their available time slots.",
    "Booking an appointment is easy! Simply go to your dashboard and click on 'Bookings' to see available counsellors and schedule your session.",
  ],
  screening: [
    "Mental health screenings help assess your current emotional state. You can take PHQ-9 (for depression) or GAD-7 (for anxiety) assessments in the Screening section.",
    "Our mental health screenings are designed to help you understand your current emotional wellbeing. Visit the Screening page to take a confidential assessment.",
    "I recommend taking our mental health screenings to better understand your emotional state. They're confidential and provide valuable insights about your mental health.",
  ],
  community: [
    "The Peer Community is a safe space to share experiences and connect with others. You can post anonymously and support fellow students.",
    "Our Peer Community allows you to share your thoughts and experiences in a supportive environment. You can post, comment, and connect with others going through similar situations.",
    "The Peer Community is here to provide support and connection. You can share your experiences, read others' posts, and offer encouragement to fellow students.",
  ],
  resources: [
    "Our Resources section contains helpful articles, videos, and audio content on mental health topics. You'll find content in multiple languages including Hindi.",
    "Check out our Resources page for curated mental health content including articles, videos, and audio resources. Many are available in Hindi and other languages.",
    "The Resources section has a wealth of mental health content including videos, articles, and audio resources. You can filter by language to find content in Hindi or other languages.",
  ],
  counsellor: [
    "Our counsellors are qualified mental health professionals who can help with various concerns including anxiety, depression, stress, and academic challenges.",
    "You can book sessions with our trained counsellors who specialize in student mental health. They provide confidential, professional support for various mental health concerns.",
    "Our counsellors are here to support you with professional mental health guidance. They're experienced in helping students with anxiety, depression, stress, and other concerns.",
  ],
  hindi: [
    "हमारे पास हिंदी में भी संसाधन उपलब्ध हैं! Resources सेक्शन में जाकर भाषा फिल्टर का उपयोग करें।",
    "हां, हमारे पास हिंदी में वीडियो और आडियो कंटेंट उपलब्ध है। Resources पेज पर जाकर हिंदी भाषा का चयन करें।",
    "बिल्कुल! आप Resources सेक्शन में जाकर हिंदी भाषा में कंटेंट देख सकते हैं। वहां आपको वीडियो और आडियो दोनों मिलेंगे।",
  ],
  sympathetic: [
    "I'm here to help, always. You're not alone in this, and I want you to know that reaching out shows incredible strength.",
    "Thank you for trusting me with your thoughts. I'm here to support you through whatever you're going through.",
    "I appreciate you sharing that with me. Remember, it's okay to not be okay, and seeking help is a brave step forward.",
    "I'm here for you, no matter what. Your feelings are valid, and you deserve support and understanding.",
    "Thank you for being so open with me. I want you to know that your courage in reaching out means everything.",
  ],
  general: [
    "Thank you for sharing that with me. I'm here to listen and support you.",
    "I understand this is important to you. Would you like to explore some resources or speak with a counsellor?",
    "It sounds like you're going through a lot. Remember that seeking help is a sign of strength, not weakness.",
    "I'm here to support you. Our platform offers various resources and professional counselling services.",
  ],
};

// Function to categorize the message and get appropriate response
const getMockResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Handle simple acknowledgments with sympathetic responses
  if (lowerMessage.includes('ok') || lowerMessage.includes('okay') || 
      lowerMessage.includes('thanks') || lowerMessage.includes('thank you') ||
      lowerMessage.includes('alright') || lowerMessage.includes('fine')) {
    return mockResponses.sympathetic[Math.floor(Math.random() * mockResponses.sympathetic.length)];
  }
  
  // Handle stress-related queries
  if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || 
      lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
    return mockResponses.stress[Math.floor(Math.random() * mockResponses.stress.length)];
  }
  
  // Handle anxiety-related queries
  if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious') || 
      lowerMessage.includes('worried') || lowerMessage.includes('nervous') ||
      lowerMessage.includes('panic')) {
    return mockResponses.anxiety[Math.floor(Math.random() * mockResponses.anxiety.length)];
  }
  
  // Handle depression-related queries
  if (lowerMessage.includes('depress') || lowerMessage.includes('sad') || 
      lowerMessage.includes('hopeless') || lowerMessage.includes('down') ||
      lowerMessage.includes('low mood')) {
    return mockResponses.depression[Math.floor(Math.random() * mockResponses.depression.length)];
  }
  
  // Handle booking/appointment queries
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || 
      lowerMessage.includes('schedule') || lowerMessage.includes('session') ||
      lowerMessage.includes('meeting') || lowerMessage.includes('counsellor')) {
    return mockResponses.booking[Math.floor(Math.random() * mockResponses.booking.length)];
  }
  
  // Handle screening/assessment queries
  if (lowerMessage.includes('screen') || lowerMessage.includes('assessment') || 
      lowerMessage.includes('test') || lowerMessage.includes('evaluate') ||
      lowerMessage.includes('phq') || lowerMessage.includes('gad')) {
    return mockResponses.screening[Math.floor(Math.random() * mockResponses.screening.length)];
  }
  
  // Handle community/forum queries
  if (lowerMessage.includes('community') || lowerMessage.includes('forum') || 
      lowerMessage.includes('post') || lowerMessage.includes('share') ||
      lowerMessage.includes('peer') || lowerMessage.includes('connect')) {
    return mockResponses.community[Math.floor(Math.random() * mockResponses.community.length)];
  }
  
  // Handle resources queries
  if (lowerMessage.includes('resource') || lowerMessage.includes('video') || 
      lowerMessage.includes('article') || lowerMessage.includes('content') ||
      lowerMessage.includes('help') || lowerMessage.includes('guide')) {
    return mockResponses.resources[Math.floor(Math.random() * mockResponses.resources.length)];
  }
  
  // Handle Hindi language queries
  if (lowerMessage.includes('hindi') || lowerMessage.includes('हिंदी') || 
      lowerMessage.includes('hindi me') || lowerMessage.includes('hindi mein')) {
    return mockResponses.hindi[Math.floor(Math.random() * mockResponses.hindi.length)];
  }
  
  // Handle counsellor-specific queries
  if (lowerMessage.includes('counsellor') || lowerMessage.includes('therapist') || 
      lowerMessage.includes('professional') || lowerMessage.includes('expert')) {
    return mockResponses.counsellor[Math.floor(Math.random() * mockResponses.counsellor.length)];
  }
  
  // Default to general response
  return mockResponses.general[Math.floor(Math.random() * mockResponses.general.length)];
};

// Mock chat endpoint
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

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const reply = getMockResponse(message);

    res.json({
      reply,
      timestamp: new Date().toISOString(),
      isMock: true,
      note: "This is a mock response. Real chatbot integration will be implemented later.",
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history (mock)
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // In a real implementation, this would fetch from a database
    // For now, return empty array
    res.json({ messages: [] });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
