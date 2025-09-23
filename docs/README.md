# 🧠 Rapy Platform

A comprehensive full-stack web application designed to provide stigma-free, accessible, and scalable mental health support for college students.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Docker Configuration](#docker-configuration)
- [Database Management](#database-management)
- [Running the Application](#running-the-application)
- [User Roles & Access](#user-roles--access)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

This platform provides a complete mental health support ecosystem for college students, featuring:

- **Professional Counselling**: Book sessions with qualified counsellors
- **Mental Health Screenings**: PHQ-9 and GAD-7 assessments
- **Peer Community**: Anonymous support forum with commenting system
- **Educational Resources**: Videos, articles, and audio content in multiple languages
- **AI Assistant**: 24/7 intelligent chat support
- **Admin Dashboard**: Comprehensive analytics and user management
- **Multi-language Support**: English, Hindi, and Tamil

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router DOM** for routing
- **React Query** for data fetching
- **React Hot Toast** for notifications

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Express Rate Limit** for API protection
- **Nodemon** for development

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for multi-container orchestration
- **MailHog** for email testing
- **MongoDB** containerized database

## ✨ Features

### 🎯 Core Features
- **User Authentication**: Secure login/register with JWT tokens
- **Role-based Access Control**: Student, Counsellor, Admin roles
- **Responsive Design**: Works on all devices and screen sizes
- **Real-time Updates**: Live notifications and data synchronization
- **Multi-language Support**: English, Hindi, Tamil interface

### 👨‍🎓 Student Features
- **Dashboard**: Personal overview and quick actions
- **Booking System**: Schedule counselling sessions
- **Mental Health Screenings**: PHQ-9 and GAD-7 assessments
- **Peer Community**: Share experiences and support others
- **Resource Library**: Access educational content
- **AI Chat Assistant**: Get instant help and guidance

### 👩‍⚕️ Counsellor Features
- **Dashboard**: Session overview and statistics
- **Booking Management**: Approve/reject/reschedule sessions
- **Student Management**: View assigned students
- **Profile Management**: Update availability and information
- **Session Tracking**: Monitor completed and upcoming sessions

### 👨‍💼 Admin Features
- **Analytics Dashboard**: Comprehensive platform statistics
- **User Management**: Manage students, counsellors, and admins
- **Content Management**: Add/edit/delete resources
- **Video Manager**: Upload and manage YouTube videos
- **Forum Moderation**: Monitor peer community posts
- **System Monitoring**: Track platform health and usage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Docker Desktop** (for database and services)
- **Git** (for version control)

### Installing Docker Desktop

1. **Download Docker Desktop**:
   - Windows: [Download from Docker Hub](https://www.docker.com/products/docker-desktop/)
   - Mac: [Download from Docker Hub](https://www.docker.com/products/docker-desktop/)
   - Linux: Follow [Docker installation guide](https://docs.docker.com/engine/install/)

2. **Install and Start Docker Desktop**:
   ```bash
   # After installation, start Docker Desktop
   # Verify installation
   docker --version
   docker-compose --version
   ```

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SIH_REAL
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Configuration

#### Backend Environment (.env)
Create `backend/.env` file:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (MailHog for development)
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@psychological-intervention.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment (.env)
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Rapy Platform
```

## 🐳 Docker Configuration

### Docker Compose Services

The project uses Docker Compose to manage the following services:

#### 1. MongoDB Database
```yaml
mongo:
  image: mongo:7.0
  container_name: psychological-intervention-mongo
  restart: unless-stopped
  ports:
    - "27017:27017"
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: password
    MONGO_INITDB_DATABASE: psychological_intervention
  volumes:
    - mongo_data:/data/db
    - ./backend/mongo-init:/docker-entrypoint-initdb.d
```

#### 2. MailHog (Email Testing)
```yaml
mailhog:
  image: mailhog/mailhog:latest
  container_name: psychological-intervention-mailhog
  restart: unless-stopped
  ports:
    - "1025:1025"  # SMTP server
    - "8025:8025"  # Web interface
```

### Docker Commands

#### Start All Services
```bash
# Start MongoDB and MailHog
docker-compose up -d

# View running containers
docker ps
```

#### Stop All Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete all data)
docker-compose down -v
```

#### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs mongo
docker-compose logs mailhog
```

## 🗄️ Database Management

### Accessing MongoDB

#### Method 1: Docker Desktop GUI
1. Open **Docker Desktop**
2. Go to **Containers** tab
3. Find `psychological-intervention-mongo` container
4. Click on the container
5. Go to **Logs** tab to see database activity
6. Go to **Exec** tab to run commands

#### Method 2: Command Line
```bash
# Access MongoDB shell
docker exec -it psychological-intervention-mongo mongosh

# Connect with authentication
docker exec -it psychological-intervention-mongo mongosh -u admin -p password --authenticationDatabase admin

# Use the application database
use psychological_intervention
```

#### Method 3: MongoDB Compass (GUI Tool)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect with:
   - **Host**: localhost
   - **Port**: 27017
   - **Authentication**: Username/Password
   - **Username**: admin
   - **Password**: password
   - **Authentication Database**: admin

### Database Operations

#### View Collections
```javascript
// In MongoDB shell
show collections

// Expected collections:
// - users
// - bookings
// - screenings
// - forumposts
// - resources
// - notifications
// - counsellorschedules
// - sessionratings
```

#### Sample Queries
```javascript
// View all users
db.users.find().pretty()

// View bookings
db.bookings.find().pretty()

// View forum posts
db.forumposts.find().pretty()

// Count documents
db.users.countDocuments()
db.bookings.countDocuments()
```

#### Backup Database
```bash
# Create backup
docker exec psychological-intervention-mongo mongodump --username admin --password password --authenticationDatabase admin --db psychological_intervention --out /backup

# Copy backup to host
docker cp psychological-intervention-mongo:/backup ./backup
```

#### Restore Database
```bash
# Copy backup to container
docker cp ./backup psychological-intervention-mongo:/restore

# Restore database
docker exec psychological-intervention-mongo mongorestore --username admin --password password --authenticationDatabase admin --db psychological_intervention /restore/psychological_intervention
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Manual Start (Recommended for Development)
```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

#### Option 2: Using Batch Files (Windows)
```bash
# Start all services
./start-all-services.bat

# Check service status
./check-status.bat

# Stop all services
./stop-services.bat
```

### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **MailHog Web Interface**: http://localhost:8025
- **MongoDB**: localhost:27017

## 👥 User Roles & Access

### Sample Login Credentials

#### Admin Account
```
Email: admin@test.com
Password: admin123
```

#### Counsellor Accounts
```
Email: counsellor@test.com
Password: counsellor123

Email: sarah@counsellor.com
Password: counsellor123

Email: amaan@counsellor.com
Password: counsellor123

Email: monis@counsellor.com
Password: counsellor123
```

#### Student Account
```
Email: student@test.com
Password: student123
```

### Role Permissions

#### 👨‍🎓 Student
- View personal dashboard
- Book counselling sessions
- Take mental health screenings
- Post and comment in peer community
- Access educational resources
- Use AI chat assistant

#### 👩‍⚕️ Counsellor
- View counsellor dashboard
- Manage booking requests
- View assigned students
- Update profile and availability
- Access session analytics

#### 👨‍💼 Admin
- Access admin dashboard
- Manage all users
- Moderate peer community
- Manage educational resources
- View comprehensive analytics
- System configuration

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/refresh     - Refresh JWT token
POST /api/auth/logout      - User logout
```

### Bookings
```
GET    /api/bookings/my-bookings     - Get user's bookings
POST   /api/bookings                - Create new booking
PUT    /api/bookings/:id            - Update booking
DELETE /api/bookings/:id            - Cancel booking
```

### Screenings
```
GET  /api/screenings/history        - Get screening history
POST /api/screenings               - Submit screening
```

### Forum
```
GET  /api/forum/posts              - Get forum posts
POST /api/forum/posts              - Create new post
POST /api/forum/posts/:id/comments - Add comment
POST /api/forum/posts/:id/like     - Like/unlike post
```

### Resources
```
GET  /api/resources               - Get resources
POST /api/resources               - Create resource (admin)
PUT  /api/resources/:id           - Update resource (admin)
DELETE /api/resources/:id         - Delete resource (admin)
```

### Admin
```
GET  /api/admin/stats             - Get platform statistics
GET  /api/admin/users             - Get all users
PUT  /api/admin/users/:id         - Update user
GET  /api/admin/bookings          - Get all bookings
```

### Counsellor
```
GET  /api/counsellor/extended/dashboard-summary - Counsellor dashboard
GET  /api/counsellor/extended/all-bookings      - Counsellor bookings
PUT  /api/counsellor/extended/bookings/:id      - Update booking status
```

### Chat
```
POST /api/chat                    - Send message to AI assistant
```

## 📁 Project Structure

```
SIH_REAL/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Authentication, validation
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API routes
│   │   ├── scripts/             # Database scripts
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utility functions
│   │   └── server.ts            # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── contexts/            # React contexts
│   │   ├── pages/               # Page components
│   │   ├── utils/               # Utility functions
│   │   └── App.tsx              # Main app component
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
├── docker-compose.yml            # Docker services
├── start-all-services.bat       # Windows batch files
├── stop-services.bat
├── check-status.bat
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check if MongoDB container is running
docker ps | grep mongo

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

#### 2. Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3001

# Kill the process or change port in .env
```

#### 3. Frontend Build Errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

#### 4. Backend Compilation Errors
```bash
# Check TypeScript errors
cd backend
npm run build

# Fix import/export issues
npm run dev
```

#### 5. Docker Issues
```bash
# Reset Docker containers
docker-compose down -v
docker-compose up -d

# Check Docker Desktop is running
docker --version
```

### Database Issues

#### Reset Database
```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d

# Re-seed data (if needed)
cd backend
npm run seed
```

#### View Database Contents
```bash
# Access MongoDB shell
docker exec -it psychological-intervention-mongo mongosh -u admin -p password --authenticationDatabase admin

# Switch to app database
use psychological_intervention

# View collections
show collections

# Count documents
db.users.countDocuments()
```

### Performance Issues

#### Clear Cache
```bash
# Frontend cache
cd frontend
npm run build -- --force

# Backend cache
cd backend
npm run clean
```

#### Memory Issues
```bash
# Check Docker memory usage
docker stats

# Restart containers
docker-compose restart
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**: `git commit -m "Add new feature"`
6. **Push to the branch**: `git push origin feature/new-feature`
7. **Create a Pull Request**

### Code Standards

- **TypeScript**: Use strict typing
- **ESLint**: Follow linting rules
- **Prettier**: Consistent code formatting
- **Comments**: Document complex logic
- **Testing**: Add tests for new features

### Database Changes

- Update models in `backend/src/models/`
- Create migration scripts in `backend/src/scripts/`
- Update API documentation
- Test with sample data

## 📞 Support

### Getting Help

1. **Check this README** for common issues
2. **Review the troubleshooting section**
3. **Check Docker Desktop** for container status
4. **Verify environment variables** are set correctly
5. **Check browser console** for frontend errors
6. **Check terminal logs** for backend errors

### Useful Commands

```bash
# Quick health check
docker ps
curl http://localhost:3001/api/health

# View all logs
docker-compose logs -f

# Reset everything
docker-compose down -v && docker-compose up -d
```

---

## 🎉 Conclusion

Rapy Platform provides a comprehensive solution for student mental health support. With its modern tech stack, responsive design, and robust features, it offers a professional and accessible platform for mental health care.

The Docker-based setup ensures easy deployment and management, while the detailed documentation helps with maintenance and development.

**Happy coding and helping students with their mental health journey! 🧠💙**

