# Batch Files for Psychological Intervention Platform

This directory contains batch files to help you manage the Psychological Intervention Platform services.

## Available Batch Files

### 1. `setup-and-run.bat`
**Purpose**: Complete setup and startup of the platform
- Installs all dependencies (backend and frontend)
- Starts Docker services (MongoDB, MailHog)
- Starts backend server with proper environment variables
- Starts frontend server
- **Use this**: When setting up the platform for the first time or after dependency changes

### 2. `start-services.bat`
**Purpose**: Quick startup of all services
- Stops any existing processes
- Starts Docker services
- Starts backend and frontend servers
- Tests backend health
- **Use this**: For regular daily startup when dependencies are already installed

### 3. `stop-services.bat`
**Purpose**: Stop all running services
- Stops all Node.js processes
- Stops all npm processes
- Stops Docker services
- **Use this**: When you want to completely shut down the platform

### 4. `check-status.bat`
**Purpose**: Check the status of all services
- Tests backend server health
- Tests frontend server availability
- Checks Docker services status
- Shows running Node.js processes
- **Use this**: To verify if services are running properly

### 5. `test-login-flow.bat`
**Purpose**: Test login functionality
- Tests counsellor login
- Tests student login
- Tests admin login
- **Use this**: To verify authentication is working

## Quick Start Guide

### First Time Setup:
1. Run `setup-and-run.bat`
2. Wait 3-5 minutes for full compilation
3. Open http://localhost:3000 in your browser

### Daily Usage:
1. Run `start-services.bat`
2. Wait 2-3 minutes for services to start
3. Use `check-status.bat` to verify everything is running

### Troubleshooting:
1. Run `check-status.bat` to see what's not working
2. If issues persist, run `stop-services.bat` then `start-services.bat`
3. For login issues, run `test-login-flow.bat`

## Login Credentials

### Student Account:
- Email: `student@test.com`
- Password: `password123`

### Admin Account:
- Email: `admin@test.com`
- Password: `admin123`

### Counsellor Accounts:
- **Dr. Sarah Johnson**: `sarah@counsellor.com` / `sarah123`
- **Dr. Amaan Ahmed**: `amaan@counsellor.com` / `amaan123`
- **Dr. Monis Kumar**: `monis@counsellor.com` / `monis123`

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MailHog (Email Testing)**: http://localhost:8025
- **Backend Health Check**: http://localhost:3001/health

## Common Issues

### "Port already in use" errors:
- Run `stop-services.bat` first
- Wait 10 seconds
- Run `start-services.bat`

### "Route not found" errors:
- Wait 2-3 minutes for backend compilation
- Check backend console for compilation errors
- Restart with `stop-services.bat` then `start-services.bat`

### "Too many requests" errors:
- Wait 15 minutes for rate limit to reset
- Or restart backend server

### Login "Invalid credentials" errors:
- Verify you're using the correct email/password combinations
- Run `test-login-flow.bat` to test authentication

## Notes

- All batch files use PowerShell-compatible commands
- Docker must be installed and running
- Node.js and npm must be installed
- Services may take 2-5 minutes to fully start depending on your system
- Always wait for compilation to complete before testing the application
