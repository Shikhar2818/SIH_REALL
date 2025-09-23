# 🤖 AI Chatbot Integration Guide

This document explains how the Dr. Sarah AI Mental Health Chatbot has been integrated into the Rapy Platform.

## 📋 Overview

The AI chatbot integration provides users with an intelligent mental health companion that can:
- Provide empathetic responses to mental health concerns
- Offer evidence-based coping strategies
- Detect crisis situations and provide emergency resources
- Support students with anxiety, depression, and stress management
- Maintain conversation context for personalized interactions

## 🏗️ Architecture

### Backend Integration
- **AI Service**: Python Flask API running on port 5000
- **Main Backend**: Node.js/Express API running on port 3001
- **Communication**: HTTP requests between services
- **Authentication**: JWT tokens passed through to AI service

### Frontend Integration
- **New Page**: `/ai-chatbot` route accessible to all authenticated users
- **Navigation**: Added to main navigation menu
- **Real-time Chat**: Streaming responses for better UX
- **Fallback Support**: Graceful degradation when AI service is unavailable

## 🚀 Quick Start

### 1. Start AI Chatbot Service
```bash
# Windows
start-ai-chatbot.bat

# Linux/Mac
./start-ai-chatbot.sh
```

### 2. Start Main Application
```bash
# Start all services together
start-with-ai-chatbot.bat

# Or start individually:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Chatbot**: http://localhost:5000
- **AI Chatbot Page**: http://localhost:3000/ai-chatbot

## 🔧 Configuration

### Environment Variables
Add to your `.env` file:
```env
# AI Chatbot Configuration
AI_CHATBOT_URL=http://localhost:5000
```

### Dependencies
The AI chatbot requires Python 3.8+ with the following packages:
- transformers
- torch
- flask
- flask-cors
- And more (see `bot/requirements.txt`)

## 📁 File Structure

```
SIH_REAL/
├── bot/                          # AI Chatbot Service
│   ├── model.py                  # Core AI model logic
│   ├── start_backend.py          # AI service startup
│   ├── src/backend/enhanced_api.py # Flask API
│   └── requirements.txt          # Python dependencies
├── backend/src/routes/aiChat.ts  # Node.js AI integration
├── frontend/src/pages/AIChatbot.tsx # React AI chat page
└── start-ai-chatbot.bat          # AI service startup script
```

## 🔌 API Endpoints

### AI Chatbot Service (Port 5000)
- `GET /api/health` - Health check
- `POST /api/chat` - Regular chat endpoint
- `POST /api/chat/stream` - Streaming chat endpoint
- `POST /api/clear` - Clear conversation history

### Main Backend Integration (Port 3001)
- `GET /api/ai-chat/health` - AI service health check
- `POST /api/ai-chat` - Forward chat to AI service
- `POST /api/ai-chat/stream` - Forward streaming chat
- `POST /api/ai-chat/clear` - Clear AI conversation
- `GET /api/ai-chat/status` - Get AI service status

## 🎯 Features

### For Users
- **Intelligent Conversations**: Natural language processing with context awareness
- **Mental Health Focus**: Specialized for college student mental health concerns
- **Crisis Detection**: Automatic detection of concerning language with emergency resources
- **Real-time Responses**: Streaming responses for better user experience
- **Conversation History**: Maintains context across multiple interactions

### For Administrators
- **Service Monitoring**: Health checks and status monitoring
- **Fallback Support**: Graceful degradation when AI service is unavailable
- **User Authentication**: Integrated with existing user system
- **Role-based Access**: Available to students, counsellors, and admins

## 🛠️ Technical Details

### AI Model
- **Base Model**: Microsoft Phi-3 Mini 4K Instruct
- **Quantization**: 4-bit for GPU efficiency
- **Context Length**: 3072 tokens
- **Hardware Requirements**: RTX 2060+ (4GB VRAM) or CPU fallback

### Response Types
- **Empathetic Responses**: Quick validation and support
- **Strategy Responses**: Detailed coping techniques
- **Crisis Responses**: Emergency resources and helplines
- **Fallback Responses**: Basic support when AI is unavailable

### Streaming Implementation
- **Server-Sent Events**: Real-time token streaming
- **Fallback Support**: Regular HTTP requests if streaming fails
- **Error Handling**: Graceful degradation on service failures

## 🔒 Security & Privacy

### Data Protection
- **No Persistent Storage**: Conversations are not permanently stored
- **User Authentication**: Requires valid JWT tokens
- **Crisis Detection**: Automatic flagging of concerning content
- **Emergency Resources**: Immediate access to helplines and support

### Privacy Considerations
- **Local Processing**: AI model runs locally (no external API calls)
- **Temporary Context**: Conversation history cleared periodically
- **Secure Communication**: HTTPS in production environments

## 🚨 Crisis Support

The AI chatbot includes comprehensive crisis detection and response:

### Crisis Keywords Detection
- Suicide ideation
- Self-harm indicators
- Violence threats
- Emergency situations

### Emergency Resources
- **National Emergency Services**: 112 (Universal)
- **India Mental Health Helplines**: Multiple 24/7 services
- **International Helplines**: US and global support
- **Campus Resources**: College counseling centers

## 🔧 Troubleshooting

### Common Issues

1. **AI Service Not Starting**
   - Check Python dependencies: `pip install -r bot/requirements.txt`
   - Verify GPU drivers and CUDA installation
   - Check available memory (4GB+ VRAM recommended)

2. **Slow Responses**
   - Close other GPU applications
   - Check GPU memory usage
   - Consider CPU fallback mode

3. **Connection Errors**
   - Verify AI service is running on port 5000
   - Check firewall settings
   - Ensure backend can reach AI service

### Performance Optimization
- **GPU Memory**: Close unnecessary applications
- **Model Loading**: First run may take several minutes
- **Context Management**: Conversations are limited to 8 turns
- **Memory Cleanup**: Automatic GPU memory clearing

## 📊 Monitoring

### Health Checks
- **AI Service Health**: `/api/ai-chat/health`
- **Service Status**: `/api/ai-chat/status`
- **Model Status**: GPU memory and model loading status

### Logs
- **Backend Logs**: Node.js application logs
- **AI Service Logs**: Python Flask application logs
- **Error Tracking**: Comprehensive error logging and reporting

## 🚀 Deployment

### Development
1. Start AI chatbot service
2. Start main backend service
3. Start frontend service
4. Access via http://localhost:3000/ai-chatbot

### Production Considerations
- **GPU Requirements**: Ensure adequate GPU memory
- **Model Caching**: Consider model pre-loading
- **Load Balancing**: Multiple AI service instances
- **Monitoring**: Health checks and alerting
- **Security**: HTTPS and secure communication

## 📝 Usage Examples

### Student Interactions
```
Student: "I'm feeling anxious about my exams"
Dr. Sarah: "I understand that exam anxiety can feel overwhelming. It's completely normal to feel this way. Would you like me to share some specific techniques that can help manage exam anxiety?"
```

### Crisis Response
```
Student: "I want to hurt myself"
Dr. Sarah: "🚨 I'm very concerned about what you're sharing. Your safety is the most important thing right now. Please reach out for immediate help..."
```

## 🤝 Support

For technical issues or questions about the AI chatbot integration:
1. Check the troubleshooting section above
2. Review the AI service logs
3. Verify all dependencies are installed
4. Ensure proper hardware requirements are met

---

**Note**: This AI provides support and guidance, but is not a replacement for professional mental health care. In emergencies, please contact professional help or emergency services immediately.
