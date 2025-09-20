# Digital Psychological Intervention Platform

A comprehensive mental health support platform designed specifically for college students. This platform provides professional counselling services, mental health screenings, educational resources, and AI-powered chat support in a stigma-free, accessible environment.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB 6.0+
- Google OAuth credentials

### One-Line Setup

```bash
docker compose up --build
```

This will start all services:
- Frontend (React) on http://localhost:3000
- Backend (Express) on http://localhost:3001
- MongoDB on localhost:27017
- MailHog (email testing) on http://localhost:8025

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Query** for state management
- **React Hook Form** for form handling

### Backend
- **Node.js** with **Express** and **TypeScript**
- **Mongoose** for MongoDB ODM
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **Nodemailer** for email notifications
- **Express Validator** for input validation

### Infrastructure
- **Docker** for containerization
- **MongoDB 6** as the database
- **MailHog** for email testing
- **Jest** for unit testing
- **Playwright** for E2E testing

## 📁 Project Structure

```
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Language)
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   └── Dockerfile
├── backend/                 # Express backend application
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── Dockerfile
├── scripts/                 # Utility scripts
│   └── import.js          # CSV/JSON import tool
├── docker-compose.yml      # Docker services configuration
└── README.md
```

## 🔧 Environment Setup

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

### 2. Environment Variables

Create `.env` file in the project root:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@psychological-intervention.com

# Application
NODE_ENV=development
PORT=3001
ALLOW_MINIMAL_SEED=true
```

## 🎯 Core Features

### 1. Authentication & User Management
- **Email/Password Registration**: Students can register with email and password
- **Google OAuth**: One-click sign-in with Google
- **Profile Completion**: Roll number and consent collection
- **JWT Authentication**: Secure token-based authentication with refresh tokens

### 2. Counselling Services
- **Pre-seeded Counsellors**: Monis and Amaan are automatically seeded
- **Booking System**: Students can book appointments with counsellors
- **Email Notifications**: Counsellors receive email notifications for new bookings
- **Availability Management**: Counsellors can set their availability slots

### 3. Mental Health Screenings
- **PHQ-9 Assessment**: Depression screening questionnaire
- **GAD-7 Assessment**: Anxiety screening questionnaire
- **Severity Analysis**: Automatic severity calculation and recommendations
- **Anonymized Analytics**: Admin dashboard with aggregate statistics

### 4. Educational Resources
- **Multi-format Support**: Videos, audio, and PDF resources
- **Language Support**: English, Hindi, and Tamil
- **Search & Filter**: Advanced filtering by type, language, and tags
- **Offline Access**: Resources available for offline viewing

### 5. AI Chat Support
- **24/7 Availability**: Always-available chat widget
- **Context-aware Responses**: Intelligent responses based on user input
- **Smooth Animations**: Framer Motion powered interactions
- **Mock Implementation**: Ready for real chatbot integration

### 6. Admin Dashboard
- **Analytics Overview**: Key metrics and statistics
- **Screening Insights**: Anonymized mental health data
- **Booking Management**: Appointment statistics and management
- **Data Export**: Export functionality for reports

## 📊 Database Models

### User (Student)
```typescript
{
  name: string
  email: string
  rollNumber?: string
  collegeId?: string
  hashedPassword?: string
  consent: boolean
  googleId?: string
  createdAt: Date
}
```

### Counsellor
```typescript
{
  name: string
  email: string
  verified: boolean
  languages: string[]
  availabilitySlots: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
  createdAt: Date
}
```

### Booking
```typescript
{
  studentId: ObjectId
  counsellorId: ObjectId
  slotStart: Date
  slotEnd: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createdAt: Date
}
```

### Screening
```typescript
{
  userId: ObjectId
  type: 'PHQ9' | 'GAD7'
  responses: {
    questionId: string
    score: number
  }[]
  totalScore: number
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google/url` - Get Google OAuth URL
- `POST /api/auth/google/callback` - Handle Google OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Screenings
- `POST /api/screenings` - Submit screening responses
- `GET /api/screenings/history` - Get user's screening history
- `GET /api/screenings/questions/:type` - Get screening questions
- `GET /api/screenings/summary` - Get anonymized analytics (admin)

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Counsellors
- `GET /api/counsellors` - List all counsellors
- `GET /api/counsellors/:id` - Get counsellor details
- `GET /api/counsellors/:id/availability` - Get availability for date

### Chat
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat/history` - Get chat history

## 🤖 Chatbot Integration

The platform includes a mock chatbot endpoint ready for integration with real AI services.

### API Contract

**Request:**
```json
{
  "message": "I feel stressed about exams"
}
```

**Response:**
```json
{
  "reply": "I understand you're feeling stressed. It's completely normal to feel this way. Have you tried any relaxation techniques like deep breathing or meditation?",
  "timestamp": "2024-01-15T10:30:00Z",
  "isMock": true,
  "note": "This is a mock response. Real chatbot integration goes here."
}
```

### Integration Steps

1. Replace the mock responses in `/backend/src/routes/chat.ts`
2. Integrate with your preferred AI service (OpenAI, Anthropic, etc.)
3. Update the response format as needed
4. Test the integration thoroughly

## 📥 Import Tool

The platform includes a comprehensive import tool for adding real data.

### Usage

```bash
# Import students
node scripts/import.js students ./data/students.csv

# Import counsellors
node scripts/import.js counsellors ./data/counsellors.csv

# Import resources
node scripts/import.js resources ./data/resources.csv
```

### CSV Headers

#### Students CSV
```csv
name,email,rollNumber,collegeId,consent
John Doe,john@college.edu,CS2023001,COLLEGE001,true
```

#### Counsellors CSV
```csv
name,email,registrationId,languages
Dr. Smith,smith@clinic.com,REG123,"English,Hindi"
```

#### Resources CSV
```csv
title,type,language,fileRef,tags,offlineAvailable,description
"Stress Management Video",video,English,/videos/stress.mp4,"stress,management",true,"A helpful video about managing stress"
```

### Validation Rules

- **Students**: name, email, rollNumber, collegeId, consent (must be true)
- **Counsellors**: name, email, registrationId, languages
- **Resources**: title, type (video/audio/pdf), language, fileRef

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### E2E Tests
```bash
# Run Playwright tests
npm run test:e2e
```

### Accessibility Testing
```bash
# Run axe accessibility audit
npm run test:a11y
```

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
```

### Docker Production Build

```bash
# Build production images
docker compose -f docker-compose.prod.yml up --build
```

## 📈 Performance Targets

- **Lighthouse Score**: >90
- **Accessibility Score**: >95
- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <3s
- **Cumulative Layout Shift**: <0.1

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Helmet.js**: Security headers
- **Data Encryption**: Sensitive data encryption

## 🌐 Internationalization

The platform supports multiple languages:
- **English** (default)
- **Hindi** (हिन्दी)
- **Tamil** (தமிழ்)

Language switching is available in the navigation bar.

## 📞 Support

For technical support or questions:
- **Email**: support@psychological-intervention.com
- **Documentation**: See inline code documentation
- **Issues**: Create GitHub issues for bugs or feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 🎯 Acceptance Tests

To verify the platform is working correctly:

1. **Start the application**: `docker compose up --build`
2. **Test Google OAuth**: Register/login with Google
3. **Complete profile**: Add roll number and consent
4. **Book appointment**: Book with Monis or Amaan
5. **Check email**: Verify email in MailHog (http://localhost:8025)
6. **Take screening**: Complete PHQ-9 or GAD-7
7. **View results**: Check anonymized data in admin dashboard
8. **Test import**: Import real CSV data using import tool
9. **Chat widget**: Test mock chatbot responses

## 🔄 Updates and Maintenance

- **Regular Updates**: Keep dependencies updated
- **Security Patches**: Apply security updates promptly
- **Database Backups**: Regular MongoDB backups
- **Monitoring**: Set up application monitoring
- **Logging**: Comprehensive logging for debugging

---

**Built with ❤️ for student mental health**
