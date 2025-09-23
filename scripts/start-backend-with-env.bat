@echo off
title Backend Server with Environment Variables
color 0A

echo Setting environment variables and starting backend server...
echo.

REM Set environment variables
set JWT_SECRET=your-super-secret-jwt-key-for-development-only
set JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only
set MONGODB_URI=mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin
set SMTP_HOST=localhost
set SMTP_PORT=1025
set SMTP_USER=
set SMTP_PASS=
set SMTP_FROM=noreply@psychological-intervention.com
set NODE_ENV=development
set PORT=3001
set ALLOW_MINIMAL_SEED=true
set GOOGLE_CLIENT_ID=
set GOOGLE_CLIENT_SECRET=
set GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

echo Environment variables set:
echo JWT_SECRET: %JWT_SECRET%
echo JWT_REFRESH_SECRET: %JWT_REFRESH_SECRET%
echo MONGODB_URI: %MONGODB_URI%
echo.

echo Starting backend server...
cd backend
npm run dev
