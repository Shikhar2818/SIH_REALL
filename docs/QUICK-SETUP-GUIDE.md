# 🚀 Quick Setup Guide

## Prerequisites
- Node.js (v18+)
- Docker Desktop
- Git

## ⚡ Quick Start (5 minutes)

### 1. Clone & Install
```bash
git clone <repository-url>
cd SIH_REAL
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

### 3. Start Services
```bash
# Start Docker (MongoDB + MailHog)
docker-compose up -d

# Start Backend (Terminal 1)
cd backend && npm run dev

# Start Frontend (Terminal 2)
cd frontend && npm run dev
```

### 4. Access Application
- **App**: http://localhost:3000
- **API**: http://localhost:3001/api
- **Email**: http://localhost:8025

## 🔑 Quick Login
```
Admin: admin@test.com / admin123
Student: student@test.com / student123
Counsellor: counsellor@test.com / counsellor123
```

## 🛠 Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# Reset database (⚠️ deletes data)
docker-compose down -v
```

## 🗄️ Database Access
```bash
# MongoDB Shell
docker exec -it psychological-intervention-mongo mongosh -u admin -p password --authenticationDatabase admin

# MongoDB Compass
Host: localhost:27017
User: admin
Pass: password
Auth DB: admin
```

## 🆘 Quick Fixes
```bash
# Port in use
netstat -ano | findstr :3001

# Clear cache
cd frontend && npm run build -- --force

# Reset everything
docker-compose down -v && docker-compose up -d
```

**That's it! You're ready to go! 🎉**

